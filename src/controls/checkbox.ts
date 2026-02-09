export class CheckboxInput {
  private wrapper: HTMLDivElement;
  private nativeCheckbox: HTMLInputElement;
  private customBox: HTMLDivElement;
  private checkIcon: SVGElement;
  private container: HTMLLabelElement;
  private label: HTMLLabelElement;
  private iconsPath: string;

  private iconPaths = {
    lockIcon: 'lock-icon.svg'
  };
  
  // Состояния
  private isChecked = false;
  private isIndeterminate = false;
  private isInvalid = false;
  private isDisabled = false;

  constructor(wrapperElement: HTMLDivElement) {
    this.wrapper = wrapperElement;
    this.iconsPath = this.wrapper.getAttribute('data-iconspath') ?? '';
    
    // Проверяем, нужна ли генерация структуры
    const needsGeneration = wrapperElement.classList.contains('twpx-checkbox') && 
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
    this.isInvalid = this.wrapper.classList.contains('invalid');
    this.isDisabled = this.wrapper.classList.contains('disabled');
    
    this.init();
  }

  private generateWrapper(wrapperElement: HTMLDivElement): HTMLDivElement {
    const checkboxElement = wrapperElement.querySelector('input[type="checkbox"]');
    const labelElement = wrapperElement.querySelector('label');
    let errorElement = wrapperElement.querySelector('.twpx-checkbox-error');
    let descriptionElement = wrapperElement.querySelector('.twpx-checkbox-description');
    
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
    const container = document.createElement('div');
    container.className = 'twpx-checkbox-container';

    const label = document.createElement('label');
    label.className = 'twpx-checkbox-label';
    label.setAttribute('for', id);
    
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

    const lockIcon = document.createElement('img');
    lockIcon.className = 'twpx-checkbox-lock';
    lockIcon.src = `${this.iconsPath}${this.iconPaths.lockIcon}`;
    lockIcon.width = 32;
    lockIcon.height = 32;
    lockIcon.alt = '';
    
    checkIcon.appendChild(path);
    customBox.appendChild(checkIcon);
    
    // Label
    const span = document.createElement('span');
    span.className = 'twpx-checkbox-span';
    span.textContent = labelText;
    
    // Собираем структуру
    label.appendChild(customBox);
    label.appendChild(span);
    label.appendChild(lockIcon);

    container.appendChild(label);

    if (errorElement) container.appendChild(errorElement);
    if (descriptionElement) container.appendChild(descriptionElement);
    
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

    if (this.isInvalid) {
      this.setInvalid(true);
    }

    if (this.isDisabled) {
      this.setDisabled(true);
    }

    this.wrapper.removeAttribute('data-iconspath');
    this.wrapper.classList.remove('invalid', 'disabled');
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
    this.container.classList.remove('checked', 'indeterminate', 'invalid', 'disabled');
    
    // Добавляем соответствующие классы
    if (this.isIndeterminate) {
      this.container.classList.add('indeterminate');
      
      // Меняем SVG для indeterminate состояния
      const path = this.checkIcon.querySelector('path')!;
      path.setAttribute('d', 'M6 12H14');
      
    } else if (this.isChecked) {
      this.container.classList.add('checked');
      
      // Возвращаем обычную галочку
      const path = this.checkIcon.querySelector('path')!;
      path.setAttribute('d', 'M1 3.66667L6.2 9L14 1');
    }
    
    // Состояние disabled из нативного checkbox
    if (this.nativeCheckbox.disabled) {
      this.container.classList.add('disabled');
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
    this.container.classList.toggle('invalid', invalid);
    
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