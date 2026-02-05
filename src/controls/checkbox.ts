export class CheckboxInput {
  private wrapper: HTMLDivElement;
  private nativeCheckbox: HTMLInputElement;
  private customBox: HTMLDivElement;
  private checkIcon: SVGElement;
  private container: HTMLLabelElement;
  private label: HTMLSpanElement;
  private iconsPath: string;

  private iconPaths = {
    lockIcon: 'lock-icon.svg'
  };
  
  // Состояния
  private isChecked = false;
  private isIndeterminate = false;

  constructor(wrapperElement: HTMLDivElement) {
    this.wrapper = wrapperElement;
    this.iconsPath = this.wrapper.getAttribute('data-iconspath') ?? '';
    
    // Проверяем, нужна ли генерация структуры
    const needsGeneration = wrapperElement.classList.contains('twpx-checkbox-input') && 
                          !wrapperElement.querySelector('.twpx-checkbox-container');
    
    if (needsGeneration) {
      this.wrapper = this.generateWrapper(wrapperElement);
      wrapperElement.parentNode?.replaceChild(this.wrapper, wrapperElement);
    }
    
    // Инициализируем элементы
    this.nativeCheckbox = this.wrapper.querySelector('.twpx-checkbox__native')!;
    this.customBox = this.wrapper.querySelector('.twpx-checkbox__box')!;
    this.checkIcon = this.wrapper.querySelector('.twpx-checkbox__check')!;
    this.container = this.wrapper.querySelector('.twpx-checkbox-container')!;
    this.label = this.wrapper.querySelector('.twpx-checkbox-label')!;
    
    // Инициализируем состояния
    this.isChecked = this.nativeCheckbox.checked;
    this.isIndeterminate = this.nativeCheckbox.indeterminate;
    
    this.init();
  }

  private generateWrapper(wrapperElement: HTMLDivElement): HTMLDivElement {
    const checkboxElement = wrapperElement.querySelector('input[type="checkbox"]');
    const labelElement = wrapperElement.querySelector('label');
    
    if (!checkboxElement) {
      throw new Error('Input элемент типа checkbox не найден');
    }
    
    const id = checkboxElement.id || `checkbox-${Math.round(Math.random() * 10000)}`;
    checkboxElement.id = id;
    
    const labelText = labelElement?.textContent || 'Checkbox';
    
    // Создаем структуру
    const wrapper = wrapperElement;
    wrapper.innerHTML = '';
    
    // Копируем нативный checkbox
    const nativeCheckbox = checkboxElement.cloneNode(true) as HTMLInputElement;
    nativeCheckbox.className = 'twpx-checkbox__native';
    
    // Создаем контейнер
    const container = document.createElement('label');
    container.className = 'twpx-checkbox-container';
    container.setAttribute('for', id);
    
    // Кастомный box
    const customBox = document.createElement('div');
    customBox.className = 'twpx-checkbox__box';
    customBox.setAttribute('role', 'checkbox');
    customBox.setAttribute('aria-checked', 'false');
    customBox.setAttribute('tabindex', '0');
    
    // SVG галочка
    const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    checkIcon.setAttribute('class', 'twpx-checkbox__check');
    checkIcon.setAttribute('viewBox', '0 0 15 10');
    checkIcon.setAttribute('fill', 'none');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M1 3.66667L6.2 9L14 1');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    checkIcon.appendChild(path);
    customBox.appendChild(checkIcon);
    
    // Label
    const label = document.createElement('span');
    label.className = 'twpx-checkbox-label';
    label.textContent = labelText;
    
    // Собираем структуру
    container.appendChild(customBox);
    container.appendChild(label);
    
    wrapper.appendChild(nativeCheckbox);
    wrapper.appendChild(container);
    
    return wrapper;
  }

  private init(): void {
    // Устанавливаем начальное состояние
    this.updateVisualState();
    
    // Обработчики событий
    this.customBox.addEventListener('click', this.handleClick.bind(this));
    this.customBox.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Для нативного checkbox (синхронизация)
    this.nativeCheckbox.addEventListener('change', this.handleNativeChange.bind(this));
    
    // Для label клика
    this.container.addEventListener('click', this.handleLabelClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  }

  private handleLabelClick(): void {
    // Label клик уже обрабатывается нативным браузером через атрибут for
    // Но мы все равно синхронизируем состояние
    setTimeout(() => {
      this.updateFromNative();
    }, 0);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  private handleNativeChange(): void {
    this.updateFromNative();
  }

  private updateFromNative(): void {
    this.isChecked = this.nativeCheckbox.checked;
    this.isIndeterminate = this.nativeCheckbox.indeterminate;
    this.updateVisualState();
  }

  private toggle(): void {
    if (this.wrapper.classList.contains('disabled')) return;
    
    if (this.isIndeterminate) {
      this.isIndeterminate = false;
      this.isChecked = true;
    } else {
      this.isChecked = !this.isChecked;
    }
    
    this.updateState();
    this.triggerChangeEvent();
  }

  private updateState(): void {
    // Обновляем нативный checkbox
    this.nativeCheckbox.checked = this.isChecked;
    this.nativeCheckbox.indeterminate = this.isIndeterminate;
    
    // Обновляем ARIA атрибуты
    this.customBox.setAttribute('aria-checked', 
      this.isIndeterminate ? 'mixed' : this.isChecked.toString()
    );
    
    // Обновляем визуальное состояние
    this.updateVisualState();
  }

  private updateVisualState(): void {
    // Убираем все классы состояний
    this.wrapper.classList.remove('checked', 'indeterminate', 'invalid', 'disabled');
    
    // Добавляем соответствующие классы
    if (this.isIndeterminate) {
      this.wrapper.classList.add('indeterminate');
      
      // Меняем SVG для indeterminate состояния
      const path = this.checkIcon.querySelector('path')!;
      path.setAttribute('d', 'M6 12H14');
      
    } else if (this.isChecked) {
      this.wrapper.classList.add('checked');
      
      // Возвращаем обычную галочку
      const path = this.checkIcon.querySelector('path')!;
      path.setAttribute('d', 'M1 3.66667L6.2 9L14 1');
    }
    
    // Состояние disabled из нативного checkbox
    if (this.nativeCheckbox.disabled) {
      this.wrapper.classList.add('disabled');
    }
    
    // Состояние required
    if (this.nativeCheckbox.required) {
      this.label.classList.add('required');
    } else {
      this.label.classList.remove('required');
    }
  }

  private triggerChangeEvent(): void {
    // Триггерим событие change на нативном checkbox
    const event = new Event('change', { bubbles: true });
    this.nativeCheckbox.dispatchEvent(event);
    
    // Кастомное событие
    const customEvent = new CustomEvent('checkbox-change', {
      detail: {
        checked: this.isChecked,
        indeterminate: this.isIndeterminate,
        value: this.nativeCheckbox.value
      },
      bubbles: true
    });
    this.wrapper.dispatchEvent(customEvent);
  }

  // Публичные методы

  public check(): void {
    if (this.wrapper.classList.contains('disabled')) return;
    
    this.isChecked = true;
    this.isIndeterminate = false;
    this.updateState();
    this.triggerChangeEvent();
  }

  public uncheck(): void {
    if (this.wrapper.classList.contains('disabled')) return;
    
    this.isChecked = false;
    this.isIndeterminate = false;
    this.updateState();
    this.triggerChangeEvent();
  }

  public toggleIndeterminate(): void {
    if (this.wrapper.classList.contains('disabled')) return;
    
    this.isIndeterminate = !this.isIndeterminate;
    if (this.isIndeterminate) {
      this.isChecked = false;
    }
    this.updateState();
    this.triggerChangeEvent();
  }

  public setIndeterminate(indeterminate: boolean): void {
    if (this.wrapper.classList.contains('disabled')) return;
    
    this.isIndeterminate = indeterminate;
    if (indeterminate) {
      this.isChecked = false;
    }
    this.updateState();
    this.triggerChangeEvent();
  }

  public getIsChecked(): boolean {
    return this.isChecked;
  }

  public getIsIndeterminate(): boolean {
    return this.isIndeterminate;
  }

  public setDisabled(disabled: boolean): void {
    this.nativeCheckbox.disabled = disabled;
    this.updateVisualState();
    
    if (disabled) {
      this.customBox.setAttribute('tabindex', '-1');
    } else {
      this.customBox.setAttribute('tabindex', '0');
    }
  }

  public setInvalid(invalid: boolean): void {
    this.wrapper.classList.toggle('invalid', invalid);
    
    if (invalid) {
      this.customBox.setAttribute('aria-invalid', 'true');
    } else {
      this.customBox.removeAttribute('aria-invalid');
    }
  }

  public setRequired(required: boolean): void {
    this.nativeCheckbox.required = required;
    this.updateVisualState();
  }

  public setLabel(text: string): void {
    this.label.textContent = text;
  }

  public getValue(): string {
    return this.nativeCheckbox.value;
  }

  public setValue(value: string): void {
    this.nativeCheckbox.value = value;
  }

  public focus(): void {
    this.customBox.focus();
  }

  public blur(): void {
    this.customBox.blur();
  }

  // Метод для добавления/удаления кастомного класса
  public addCustomClass(className: string): void {
    this.wrapper.classList.add(className);
  }

  public removeCustomClass(className: string): void {
    this.wrapper.classList.remove(className);
  }
}