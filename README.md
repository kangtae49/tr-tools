# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

```powershell
PS> irm https://deno.land/install.ps1 | iex
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 42.5M  100 42.5M    0     0  6567k      0  0:00:06  0:00:06 --:--:-- 8060k
Deno was installed successfully to C:\Users\kkt\.deno\bin\deno.exe
Run 'deno --help' to get started
Stuck? Join our Discord https://discord.gg/deno
```

```
PS > deno run -A npm:create-tauri-app
✔ Project name · tr-tools
✔ Identifier · tr-tools
✔ Choose which language to use for your frontend · TypeScript / JavaScript - (pnpm, yarn, npm, deno, bun)
✔ Choose your package manager · deno
✔ Choose your UI template · React - (https://react.dev/)
✔ Choose your UI flavor · TypeScript

Template created! To get started run:
  cd tr-tools
  deno install
  deno task tauri android init

For Desktop development, run:
  deno task tauri dev

For Android development, run:
  deno task tauri android dev

```

```sh
deno add npm:react-mosaic-componen
```

```sh
deno task tauri icon public/tr-tools.svg
```