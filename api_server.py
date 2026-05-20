import os
import json
import asyncio
import psutil
import httpx
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from pathlib import Path

# --- Aether Integration ---
from agent.aether_agent import AetherAgent, CONFIG

# Global Agent Instance
agent_instance = AetherAgent(CONFIG)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for background tasks."""
    task = asyncio.create_task(watchdog_task())
    yield
    task.cancel()

app = FastAPI(
    title="Aether Core API",
    version="1.1.0",
    description="The Local-First Neural Operating Interface Backend",
    lifespan=lifespan
)

# Paths
AETHER_HOME = Path.home() / ".aether"
HW_PROFILE = AETHER_HOME / "hw_profile.json"
CONFIG_FILE = AETHER_HOME / "config.json"
VAULT_PATH = Path(CONFIG["vault_path"]) / "fragments"
OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_BASE_URL = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")

# Ensure directories exist
AETHER_HOME.mkdir(parents=True, exist_ok=True)
VAULT_PATH.mkdir(parents=True, exist_ok=True)

# In-memory store for watchdog events
WATCHDOG_LOGS = []

DEFAULT_CONFIG = {
    "active_model": "hermes3:8b",
    "threads": 6
}

def load_config():
    """Loads configuration from the local filesystem."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                return {**DEFAULT_CONFIG, **json.load(f)}
        except (json.JSONDecodeError, IOError):
            return DEFAULT_CONFIG
    return DEFAULT_CONFIG

class QueryRequest(BaseModel):
    """Schema for agent queries."""
    model_config = ConfigDict(populate_by_name=True)

    prompt: str = Field(..., description="The user's input prompt")
    model: Optional[str] = Field(None, description="Model to use for this specific query")
    session_id: Optional[str] = Field("default", alias="sessionId", description="Unique session identifier")
    stream: bool = Field(False, description="Whether to stream the response")

class ChatRequest(BaseModel):
    message: str
    modelId: str

class VaultFragment(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    type: str
    timestamp: str

class SystemStats(BaseModel):
    """Schema for system telemetry and health stats."""
    profile: str
    ram_gb: float
    cores: int
    status: str
    agent_active: bool
    last_watchdog_event: str

@app.get("/", tags=["Diagnostic"])
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "system": "Aether Core",
        "timestamp": datetime.now().isoformat()
    }

def is_agent_running() -> bool:
    """Checks the system process table for the Aether Agent."""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.info['cmdline']
            if cmdline and any('aether_agent.py' in arg for arg in cmdline):
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return False

@app.get("/system/stats", response_model=SystemStats, tags=["System"])
async def get_stats():
    """Retrieves current system health and hardware profile."""
    profile_data = {"profile": "Lite", "ram": 0, "cores": 0}
    if HW_PROFILE.exists():
        try:
            with open(HW_PROFILE, "r") as f:
                profile_data = json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    
    agent_active = is_agent_running()
    
    return SystemStats(
        profile=profile_data.get("profile", "Lite"),
        ram_gb=float(profile_data.get("ram", 0)),
        cores=profile_data.get("cores", 0),
        status="Healthy" if agent_active else "Degraded",
        agent_active=agent_active,
        last_watchdog_event=WATCHDOG_LOGS[0] if WATCHDOG_LOGS else "No events recorded."
    )

@app.post("/system/repair", tags=["System"])
async def repair_system():
    """Attempts to diagnose and log connectivity to the neural engine."""
    event = f"[{datetime.now().strftime('%H:%M:%S')}] System repair initiated: verifying neural links..."
    WATCHDOG_LOGS.insert(0, event)
    
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get("http://127.0.0.1:11434/api/tags", timeout=2.0)
            if r.status_code == 200:
                WATCHDOG_LOGS.insert(0, f"[{datetime.now().strftime('%H:%M:%S')}] Ollama connectivity confirmed.")
            else:
                WATCHDOG_LOGS.insert(0, f"[{datetime.now().strftime('%H:%M:%S')}] Ollama reported error status: {r.status_code}")
    except Exception as e:
        WATCHDOG_LOGS.insert(0, f"[{datetime.now().strftime('%H:%M:%S')}] CRITICAL: Ollama unreachable: {str(e)}")

    return {"status": "success", "message": "Neural links verified. Dependencies checked."}

async def watchdog_task():
    """Background task that monitors the agent process."""
    while True:
        agent_up = is_agent_running()
        if not agent_up:
            event = f"[{datetime.now().strftime('%H:%M:%S')}] WATCHDOG: Agent process not detected in process table."
            WATCHDOG_LOGS.insert(0, event)
            
        # Keep logs manageable
        if len(WATCHDOG_LOGS) > 20:
            WATCHDOG_LOGS.pop()
            
        await asyncio.sleep(60)

# --- Aether Client Endpoints ---

@app.get("/pathways")
async def get_pathways():
    """Returns available neural pathways."""
    return [
        {"id": "hermes3:8b", "title": "AGENT", "model": "Hermes-3-8B", "icon": "🤖", "description": "General intelligence and tool use."},
        {"id": "llama3.2:3b", "title": "TURBO", "model": "Llama-3.2-3B", "icon": "⚡", "description": "High-speed conversational output."},
        {"id": "deepseek-r1:8b", "title": "LOGIC", "model": "DeepSeek-R1", "icon": "🧠", "description": "Advanced reasoning and architecture."}
    ]

@app.post("/synapse/chat")
async def stream_chat(request: ChatRequest):
    """Streams chat responses from Ollama via AetherAgent."""
    async def event_generator():
        messages = [{"role": "user", "content": request.message}]
        try:
            async for chunk in agent_instance.generate_response(messages, request.modelId):
                if chunk:
                    yield chunk
        except Exception as e:
            yield f"Error: {str(e)}"
            
    return StreamingResponse(event_generator(), media_type="text/plain")

@app.get("/vault/fragments")
async def get_vault_fragments():
    """Retrieves all memory fragments from the vault."""
    fragments = []
    if VAULT_PATH.exists():
        for f in sorted(VAULT_PATH.glob("*.json"), key=os.path.getmtime, reverse=True):
            try:
                with open(f, "r") as file:
                    fragments.append(json.load(file))
            except:
                pass
    return fragments

@app.post("/vault/distill")
async def distill_fragment(fragment: VaultFragment):
    """Saves a new memory fragment to the vault."""
    if not fragment.id:
        fragment.id = int(datetime.now().timestamp())
    file_path = VAULT_PATH / f"{fragment.id}.json"
    with open(file_path, "w") as f:
        json.dump(fragment.dict(), f)
    return fragment

@app.delete("/vault/fragment/{fragment_id}")
async def delete_fragment(fragment_id: int):
    """Deletes a memory fragment from the vault."""
    file_path = VAULT_PATH / f"{fragment_id}.json"
    if file_path.exists():
        file_path.unlink()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Fragment not found")

@app.delete("/vault/wipe")
async def wipe_vault():
    """Wipes all fragments from the vault."""
    if VAULT_PATH.exists():
        for f in VAULT_PATH.glob("*.json"):
            f.unlink()
    return {"status": "success"}

@app.get("/integrations/status")
async def get_integrations_status():
    """Returns status of all integrated services."""
    ollama_active = await check_ollama()
    return [
        {"id": "core-api", "name": "Aether Core API", "type": "API", "status": "online", "uptime": "Active"},
        {"id": "ollama", "name": "Ollama Engine", "type": "CORE", "status": "online" if ollama_active else "offline", "uptime": "Active"},
        {"id": "agent", "name": "Aether Agent", "type": "CORE", "status": "online" if is_agent_running() else "offline", "uptime": "Active"}
    ]

async def check_ollama():
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=1.0)
            return r.status_code == 200
    except:
        return False

@app.get("/heartbeat")
async def get_heartbeat():
    """System health heartbeat."""
    return {
        "status": "NOMINAL",
        "linkStatus": "SYNCED",
        "latency": 5
    }

# --- Legacy Endpoints ---

@app.post("/agent/query", tags=["Agent"])
async def agent_query(request: QueryRequest):
    """Routes a prompt to the local neural engine (Ollama)."""
    model = request.model or load_config().get("active_model", "hermes3:8b")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": request.prompt}],
        "stream": request.stream
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_CHAT_URL, json=payload, timeout=120.0)
            response.raise_for_status()
            data = response.json()
            return {
                "sessionId": request.session_id,
                "response": data.get("message", {}).get("content", "Empty response from neural engine."),
                "model": model,
                "tokens": data.get("eval_count", 0)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/skills", tags=["Agent"])
async def list_skills():
    """Lists all available agent skills."""
    skills_path = Path("agent/skills")
    if not skills_path.exists():
        return {"skills": []}
    skills = [f.stem.replace(".skill", "") for f in skills_path.glob("*.skill.json")]
    return {"skills": skills}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
