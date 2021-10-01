import tippy, { followCursor, hideAll } from 'tippy.js'
import { formatNumber } from './utils'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light-border.css'
// import './style.css'

/**
   * Cria o controlador de tooltips em um elemento HTML
   * @param {HTMLElement} target Elemento HTML que receberá a funcionalidade
   */
export function createTooltip (target) {
  // Configurando a tooltip
  const tooltip = tippy(target, {
    followCursor: true,
    trigger: 'manual',
    theme: 'light-border',
    placement: 'right',
    arrow: false,
    appendTo: 'parent',
    allowHTML: true,
    plugins: [followCursor],
  })

  return {
    show: (data, format) => {
      let content
      if (format && typeof format === 'function') {
        content = format(data)
      } else {
        content = `<strong>${data.name}</strong> &#8674; <small>${formatNumber(data.value)}</small>`
      }
      tooltip.setContent(content)
      tooltip.show()
    },
    hide: () => {
      tooltip.hide()
    },
    destroy: () => {
      hideAll()
      tooltip.destroy()
    },
    instance: tooltip,
    hideAll
  }
}
