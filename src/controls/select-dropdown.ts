export class SelectDropdown {
  private wrapper: HTMLDivElement;
  private container: HTMLDivElement;
  private nativeSelect: HTMLSelectElement;
  private customInput: HTMLDivElement;
  private valueDisplay: HTMLSpanElement;
  private label: HTMLLabelElement;
  private dropdown: HTMLDivElement;
  private options: NodeListOf<HTMLDivElement>;
  private iconsPath: string;
  private arrowIcon: HTMLImageElement | null;
  
  private iconPaths = {
    arrowIcon: 'arrow-icon.svg',
    arrowInvalidIcon: 'arrow-invalid-icon.svg',
    arrowDisabledIcon: 'arrow-disabled-icon.svg',
    lockIcon: 'lock-icon.svg'
  };
  
  private isOpen = false;
  private currentValue = '';
  private currentText = '';

  constructor(wrapperElement: HTMLDivElement) {
    this.wrapper = wrapperElement;
    this.iconsPath = this.wrapper.getAttribute('data-iconspath') ?? '';
    this.arrowIcon = document.createElement('img');
    
    // Проверяем, нужна ли генерация структуры
    const needsGeneration = wrapperElement.classList.contains('twpx-select') && 
                          !wrapperElement.getAttribute('data-id');
    
    if (needsGeneration) {
      this.wrapper = this.generateWrapper(wrapperElement);
      wrapperElement.parentNode?.replaceChild(this.wrapper, wrapperElement);
    }
    
    // Инициализируем элементы
    this.container = this.wrapper.querySelector('.twpx-select-container')!;
    this.nativeSelect = this.wrapper.querySelector('.twpx-select__native')!;
    this.customInput = this.wrapper.querySelector('.twpx-select__input')!;
    this.valueDisplay = this.customInput.querySelector('.twpx-select__value')!;
    this.label = this.wrapper.querySelector('.twpx-select-label')!;
    this.dropdown = this.wrapper.querySelector('.twpx-select-dropdown')!;
    this.options = this.dropdown.querySelectorAll('.twpx-select-option');

    this.init();
  }

  private generateWrapper(wrapperElement: HTMLDivElement): HTMLDivElement {
    wrapperElement?.setAttribute('data-id', `${Math.round(Math.random()*10000)}`);

    const selectElement = wrapperElement.querySelector('select');
    const labelElement = wrapperElement.querySelector('label');
    const errorElement = wrapperElement.querySelector('.twpx-select-error');
    const descriptionElement = wrapperElement.querySelector('.twpx-select-description');

    if (!selectElement) {
        throw Error('Не найдет select внутри twpx-select');
    }
    
    const options = selectElement.querySelectorAll('option');

    let labelText = options[0].textContent;

    if (labelElement) {
        labelText = labelElement.textContent;
    }
    
    // Создаем структуру
    const wrapper = wrapperElement;
    wrapper.innerHTML = '';
    
    // Копируем нативный select (скрытый)
    const nativeSelect = selectElement.cloneNode(true) as HTMLSelectElement;
    nativeSelect.className = 'twpx-select__native';
    nativeSelect.setAttribute('aria-hidden', 'true');
    
    // Создаем контейнер для кастомного select
    const container = document.createElement('div');
    container.className = 'twpx-select-container';
    
    // Кастомный input
    const customInput = document.createElement('div');
    customInput.className = 'twpx-select__input';
    customInput.setAttribute('role', 'combobox');
    customInput.setAttribute('aria-expanded', 'false');
    customInput.setAttribute('aria-haspopup', 'listbox');
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'twpx-select__value';
    valueDisplay.textContent = nativeSelect.value || '';
    
    this.arrowIcon = document.createElement('img');
    this.arrowIcon.className = 'twpx-select__arrow';
    this.arrowIcon.src = `${this.iconsPath}${this.iconPaths.arrowIcon}`;
    this.arrowIcon.alt = '';
    this.arrowIcon.width = 24;
    this.arrowIcon.height = 24;
    
    customInput.appendChild(valueDisplay);
    customInput.appendChild(this.arrowIcon);
    
    // Label
    const label = document.createElement('label');
    label.className = 'twpx-select-label';
    label.textContent = labelText;
    
    // Иконки    
    const lockIcon = document.createElement('img');
    lockIcon.className = 'twpx-select-lock';
    lockIcon.src = `${this.iconsPath}${this.iconPaths.lockIcon}`;
    lockIcon.alt = '';
    lockIcon.width = 32;
    lockIcon.height = 32;
    
    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'twpx-select-dropdown';
    dropdown.setAttribute('role', 'listbox');
    
    // Добавляем опции в dropdown
    options.forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'twpx-select-option';
      optionDiv.setAttribute('role', 'option');
      optionDiv.setAttribute('data-value', option.value);
      optionDiv.textContent = option.textContent || option.value;
      
      if (option.selected) {
        optionDiv.classList.add('selected');
        optionDiv.setAttribute('aria-selected', 'true');
      } else {
        optionDiv.setAttribute('aria-selected', 'false');
      }
      
      dropdown.appendChild(optionDiv);
    });
    
    // Собираем структуру
    container.appendChild(customInput);
    container.appendChild(label);
    container.appendChild(lockIcon);
    container.appendChild(dropdown);

    if (errorElement) container.appendChild(errorElement);
    if (descriptionElement) container.appendChild(descriptionElement);
    
    wrapper.appendChild(nativeSelect);
    wrapper.appendChild(container);
    
    // Инициализируем значения
    this.currentValue = nativeSelect.value;
    this.currentText = valueDisplay.textContent;
    
    return wrapper;
  }

  private init(): void {
    // Инициализируем состояние
    const isInvalid = this.wrapper.classList.contains('invalid');
    const isDisabled = this.wrapper.classList.contains('disabled');    

    if (isInvalid) {
      this.setInvalidState(true);
    }

    if (isDisabled) {
      this.setDisabledState(true);
    }

    this.wrapper.classList.remove('invalid', 'disabled');

    if (this.nativeSelect.value) {
      this.setFilledState(true);
    }
    
    // Добавляем обработчики
    this.customInput.addEventListener('click', this.toggleDropdown.bind(this));
    
    // Обработчики для опций
    this.options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(option);
      });
    });
    
    // Закрытие dropdown при клике вне
    document.addEventListener('click', this.handleClickOutside.bind(this));
    
    // Обработчики для нативного select (синхронизация)
    this.nativeSelect.addEventListener('change', this.handleNativeChange.bind(this));
    
    // Обработчики для клавиатуры
    this.customInput.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Обработчик blur
    this.customInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!this.container.contains(document.activeElement)) {
          this.closeDropdown();
        }
      }, 0);
    });
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    if (this.container.classList.contains('disabled')) return;
    
    this.isOpen = true;
    this.container.classList.add('open');
    this.customInput.setAttribute('aria-expanded', 'true');
    
    // Прокручиваем к выбранной опции
    const selectedOption = this.dropdown.querySelector('.selected');
    if (selectedOption) {
      selectedOption.scrollIntoView({ block: 'nearest' });
    }
  }

  private closeDropdown(): void {
    this.isOpen = false;
    this.container.classList.remove('open');
    this.customInput.setAttribute('aria-expanded', 'false');
  }

  private handleClickOutside(event: MouseEvent): void {
    if (!this.wrapper.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  private selectOption(option: HTMLDivElement): void {
    const value = option.getAttribute('data-value') || '';
    const text = option.textContent || '';
    
    // Обновляем UI
    this.valueDisplay.textContent = text;
    this.currentValue = value;
    this.currentText = text;
    
    // Обновляем нативный select
    this.nativeSelect.value = value;
    this.nativeSelect.dispatchEvent(new Event('change'));
    
    // Обновляем классы у опций
    this.options.forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
    });
    option.classList.add('selected');
    option.setAttribute('aria-selected', 'true');
    
    // Обновляем состояние filled
    this.setFilledState(value !== '');
    this.clearValidationState();
    
    this.closeDropdown();
  }

  private handleNativeChange(): void {
    // Синхронизация с нативным select
    const selectedOption = this.nativeSelect.selectedOptions[0];
    this.valueDisplay.textContent = selectedOption?.textContent || '';
    this.currentValue = this.nativeSelect.value;
    this.currentText = selectedOption?.textContent || '';
    
    this.setFilledState(this.nativeSelect.value !== '');
    this.clearValidationState();
    
    // Обновляем выбранную опцию в dropdown
    this.options.forEach(option => {
      const value = option.getAttribute('data-value') || '';
      const isSelected = value === this.nativeSelect.value;
      
      option.classList.toggle('selected', isSelected);
      option.setAttribute('aria-selected', isSelected.toString());
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDropdown();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.handleArrowKeys(event.key);
    }
  }

  private handleArrowKeys(key: string): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }
    
    const currentIndex = Array.from(this.options).findIndex(opt => 
      opt.classList.contains('selected')
    );
    
    let newIndex = currentIndex;
    
    if (key === 'ArrowDown') {
      newIndex = currentIndex < this.options.length - 1 ? currentIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : this.options.length - 1;
    }
    
    if (newIndex !== -1) {
      this.options[newIndex].scrollIntoView({ block: 'nearest' });
      this.highlightOption(this.options[newIndex]);
    }
  }

  private highlightOption(option: HTMLDivElement): void {
    this.options.forEach(opt => opt.classList.remove('highlighted'));
    option.classList.add('highlighted');
  }

  // Публичные методы (аналогичные UrlInput)
  public validate(): boolean {
    if (this.nativeSelect.required && !this.currentValue) {
      this.setInvalidState(true);
      return false;
    }
    
    this.clearValidationState();
    return true;
  }

  private setFilledState(filled: boolean): void {
    this.container.classList.toggle('filled', filled);
  }

  public setDisabledState(disabled: boolean): void {
    if (this.container)
      this.container.classList.toggle('disabled', disabled);

    if (this.nativeSelect)
      this.nativeSelect.disabled = disabled;

    if (this.arrowIcon)
      this.arrowIcon.src = `${this.iconsPath}${disabled ? this.iconPaths.arrowDisabledIcon : this.iconPaths.arrowIcon}`;
    
    if (disabled)
      this.closeDropdown();
  }

  private setInvalidState(invalid: boolean): void {
    if (this.container)
      this.container.classList.toggle('invalid', invalid);

    if (this.arrowIcon)
      this.arrowIcon.src = `${this.iconsPath}${invalid ? this.iconPaths.arrowInvalidIcon : this.iconPaths.arrowIcon}`;
  }

  public clearValidationState(): void {
    this.container.classList.remove('invalid');
  }

  public getValue(): string {
    return this.currentValue;
  }

  public getText(): string {
    return this.currentText;
  }

  public setValue(value: string): void {
    const option = Array.from(this.options).find(opt => 
      opt.getAttribute('data-value') === value
    );
    
    if (option) {
      this.selectOption(option);
    } else {
      this.reset();
    }
  }

  public reset(): void {
    const defaultOption = this.dropdown.querySelector('.twpx-select-option[data-value=""]');
    if (defaultOption) {
      this.selectOption(defaultOption as HTMLDivElement);
    }
  }

  public setDisabled(disabled: boolean): void {
    this.setDisabledState(disabled);
  }

  public setInvalid(invalid: boolean): void {
    this.setInvalidState(invalid);
  }

  public isValid(): boolean {
    return this.validate();
  }

  public setLabelText(text: string): void {
    this.label.textContent = text;
  }

  public setPlaceholder(text: string): void {
    const emptyOption = this.options[0];
    if (emptyOption) {
      emptyOption.textContent = text;
      if (!this.currentValue) {
        this.valueDisplay.textContent = text;
      }
    }
  }

  public setRequired(required: boolean): void {
    this.nativeSelect.required = required;
  }

  public focus(): void {
    this.customInput.focus();
  }

  public blur(): void {
    this.customInput.blur();
  }

  public addOption(value: string, text: string): void {
    // Добавляем в нативный select
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    this.nativeSelect.appendChild(option);
    
    // Добавляем в кастомный dropdown
    const optionDiv = document.createElement('div');
    optionDiv.className = 'twpx-select-option';
    optionDiv.setAttribute('role', 'option');
    optionDiv.setAttribute('data-value', value);
    optionDiv.textContent = text;
    optionDiv.setAttribute('aria-selected', 'false');
    
    optionDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectOption(optionDiv);
    });
    
    this.dropdown.appendChild(optionDiv);
    this.options = this.dropdown.querySelectorAll('.twpx-select-option');
  }

  public removeOption(value: string): void {
    // Удаляем из нативного select
    const nativeOption = this.nativeSelect.querySelector(`option[value="${value}"]`);
    if (nativeOption) {
      nativeOption.remove();
    }
    
    // Удаляем из кастомного dropdown
    const customOption = this.dropdown.querySelector(`.twpx-select-option[data-value="${value}"]`);
    if (customOption) {
      customOption.remove();
      this.options = this.dropdown.querySelectorAll('.twpx-select-option');
    }
    
    // Если удалили текущее значение - сбрасываем
    if (this.currentValue === value) {
      this.reset();
    }
  }
}