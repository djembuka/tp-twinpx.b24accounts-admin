import './styles/utils.css'
import './styles/common.css'
import './styles/header.css'
import './styles/footer.css'
import './styles/message.css'
import './styles/block.css'

import './styles/controls/url-input.css'

import { UrlInput } from './controls/url-input'

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.twpx-b24a-url-input-wrapper').forEach((wrapper) => {
        const input = new UrlInput(wrapper as HTMLDivElement);
        input.setInvalid(true)
    })
});