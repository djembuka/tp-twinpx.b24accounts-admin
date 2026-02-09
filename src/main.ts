import './styles/utils.css'
import './styles/common.css'
import './styles/header.css'
import './styles/footer.css'
import './styles/message.css'
import './styles/block.css'

import './styles/controls/url-input.css'
import './styles/controls/select-dropdown.css'
import './styles/controls/checkbox.css'

import { UrlInput } from './controls/url-input'
import { SelectDropdown } from './controls/select-dropdown'
import { CheckboxInput } from './controls/checkbox'

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.twpx-url-input').forEach((wrapper) => {
        new UrlInput(wrapper as HTMLDivElement);
    });

    document.querySelectorAll('.twpx-select').forEach((wrapper) => {
        new SelectDropdown(wrapper as HTMLDivElement);
    });

    document.querySelectorAll('.twpx-checkbox').forEach((wrapper) => {
        new CheckboxInput(wrapper as HTMLDivElement);
    });
});