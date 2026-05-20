<div align="center">

# 📖 Aether — Daily Usage Guide

*Quick reference for interacting with your Aether Workstation.*

</div>

---

If you haven't installed Aether yet, please start with the **[Getting Started Guide](docs/GETTING_STARTED.md)**.

## 🚀 Launching the Application

Once you have downloaded the correct application for your operating system from the [GitHub Releases](https://github.com/earnerbaymalay/aether-tauri/releases) page, follow these steps:

- **On Windows:** Unzip the package and run the `Aether.exe` executable. You can create a shortcut for easy access.
- **On macOS:** Open the `.dmg` file and drag the `Aether.app` into your `Applications` folder.
- **On Linux:** Make the `.AppImage` file executable (`chmod +x Aether.AppImage`) and then run it.

The application will handle starting all necessary background services for you.

<div align="center">
  <img src="docs/assets/terminal_prompt.png" alt="Terminal Prompt" width="70%" />
</div>

---

## 🚀 Navigation & Control

Aether's Mission Control interface is organized into specialized views. Use the sidebar to navigate:

- **🧠 Neural Synapse:** Your primary interface for local inference. Select a pathway and start a session.
- **🗄️ AetherVault:** Browse and manage your long-term memory fragments. Purge or search history with zero cloud overhead.
- **🌌 Pathways:** View and switch between different cognitive specialists (AGENT, TURBO, LOGIC).
- **🩺 Health:** Real-time system diagnostics. Monitor neural link latency and service status.
- **🔌 Integrations:** Manage MCP servers, LSP diagnostics, and external API keys for hybrid workflows.
- **🏪 Marketplace:** Discover and install new neural skills and toolbox extensions.
- **🛡️ Security:** Access Nexus Shield controls to harden your OS and suppress telemetry.
- **📱 Neural Link:** Generate secure P2P sync codes to link your AetherVault with mobile devices.

---

## 📊 The Diagnostic Dashboard

Aether continuously monitors your hardware to ensure optimal inference performance. The **Diagnostic Dashboard** provides real-time telemetry:

- **CPU & RAM:** Tracks host utilization.
- **Neural Link:** Monitors the latency of the bridge between the UI and the Python engine.
- **Service Status:** Confirms that Ollama and OpenClaw are active.

```bash
# For advanced users, the standalone monitor can still be run via:
python3 toolbox/net_monitor.py
```

---

## 🧠 Neural Pathways (Cognitive Specialists)

Aether routes your intelligence through specialized models. Each pathway is optimized for specific workloads:

- **🤖 AGENT (Hermes-3-8B):** General intelligence and autonomous tool use.
- **⚡ TURBO (Llama-3.2-3B):** High-speed conversational output and quick tasks.
- **🧠 LOGIC (DeepSeek-R1):** Advanced reasoning, architecture, and chain-of-thought planning.
- **💻 CODE (Qwen2.5-Coder):** (Pro) Specialized syntax generation and refactoring.

---

*For deeper configuration, memory synchronization, and MCP tool setup, see the **[Advanced Features Guide](docs/ADVANCED_FEATURES.md)**.*
