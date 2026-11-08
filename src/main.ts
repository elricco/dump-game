import { parseConfig } from './core/config'
import { renderStatus } from './render/status'

const status = document.getElementById('status')
if (status) renderStatus(status, parseConfig(new URLSearchParams(window.location.search)))
