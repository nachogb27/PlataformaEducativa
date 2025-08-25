class WSClient {
  constructor(url) {
    this.url = url
    this.socket = null
    this.listeners = {}
  }

  connect() {
    this.socket = new WebSocket(this.url)
    this.socket.onopen = () => this.emit('open')
    this.socket.onclose = () => this.emit('close')
    this.socket.onerror = (e) => this.emit('error', e)
    this.socket.onmessage = (msg) => {
      let data
      try { data = JSON.parse(msg.data) } catch { data = msg.data }
      this.emit('message', data)
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(data))
    }
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(cb)
  }

  emit(event, ...args) {
    (this.listeners[event] || []).forEach(cb => cb(...args))
  }

  close() {
    if (this.socket) this.socket.close()
  }
}

export default WSClient
