# Minimal on-screen keypad sending key events via WebSocket (localhost only).
import asyncio, websockets, tkinter as tk, json

WS_PORT = 8765

clients=set()

async def ws_handler(ws):
    clients.add(ws)
    try:
        async for _ in ws:
            pass
    finally:
        clients.remove(ws)

def send_text(txt):
    msg = json.dumps({"type":"text","value":txt})
    asyncio.get_event_loop().create_task(broadcast(msg))

async def broadcast(msg):
    dead=set()
    for c in clients:
        try:
            await c.send(msg)
        except:
            dead.add(c)
    for d in dead:
        clients.discard(d)

def gui():
    root = tk.Tk()
    root.title("FastDoctor Keypad")
    root.geometry("360x480")
    entry = tk.Entry(root, font=("Segoe UI", 16))
    entry.pack(fill="x", padx=8, pady=8)
    def push(ch):
        entry.insert("end", ch)
        send_text(ch)
    def back():
        if entry.get():
            entry.delete(len(entry.get())-1, "end")
            asyncio.get_event_loop().create_task(broadcast(json.dumps({"type":"key","value":"Backspace"})))
    def enter():
        asyncio.get_event_loop().create_task(broadcast(json.dumps({"type":"key","value":"Enter"})))
    keys=[['1','2','3'],['4','5','6'],['7','8','9'],['한/영','0','←']]
    frame=tk.Frame(root); frame.pack(expand=True, fill="both")
    for r,row in enumerate(keys):
        fr=tk.Frame(frame); fr.pack(expand=True, fill="both")
        for c,k in enumerate(row):
            def mkcmd(x=k):
                return (back if x=='←' else (enter if x=='Enter' else (lambda: push(x))))
            btn=tk.Button(fr, text=k, command=mkcmd(), height=2, font=("Segoe UI", 14))
            btn.pack(side="left", expand=True, fill="both", padx=4, pady=4)
    tk.Button(root, text="Enter", command=enter).pack(fill="x", padx=8, pady=8)
    root.mainloop()

async def main():
    ws_server = await websockets.serve(ws_handler, "127.0.0.1", WS_PORT)
    print(f"WebSocket listening on ws://127.0.0.1:{WS_PORT}")
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, gui)
    await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
