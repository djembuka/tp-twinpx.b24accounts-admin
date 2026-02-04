export class UrlInput {
  private wrapper: HTMLDivElement;
  private label: HTMLLabelElement | null;
  private input: HTMLInputElement;
  private inputContainer: HTMLDivElement | null;
  private clearIcon: HTMLImageElement | null;
  private clearInvalidIcon: HTMLImageElement | null;
  private lockIcon: HTMLImageElement | null;

  private iconPaths = {
    urlIcon: '/images/url-icon.svg',
    clearIcon: '/images/clear-icon.svg',
    clearInvalidIcon: '/images/clear-invalid-icon.svg',
    lockIcon: '/images/lock-icon.svg'
  };

  constructor(wrapperElement: HTMLDivElement) {
    // Сохраняем ссылку на обертку
    this.wrapper = wrapperElement;
    
    // Проверяем, что впервые вызван класс на элементе
    const noInstanceOnDiv = wrapperElement.classList.contains('twpx-url-input') && !wrapperElement.getAttribute('data-id');
    if (noInstanceOnDiv) {
      // Генерируем обертку
      this.wrapper = this.generateWrapper(wrapperElement as HTMLDivElement);
      // Заменяем исходный элемент на сгенерированную обертку
      wrapperElement.parentNode?.replaceChild(this.wrapper, wrapperElement);
    }
    
    // Находим элементы внутри обертки
    this.inputContainer = this.wrapper.querySelector('.twpx-url-input-container');
    this.label = this.wrapper.querySelector('.twpx-url-input-label');
    this.input = this.wrapper.querySelector('input[type="url"]') as HTMLInputElement;
    this.clearIcon = this.wrapper.querySelector('.twpx-url-input-clear');
    this.clearInvalidIcon = this.wrapper.querySelector('.twpx-url-input-clear-invalid');
    this.lockIcon = this.wrapper.querySelector('.twpx-url-input-lock');
    
    if (!this.input) {
      throw new Error('Input элемент типа url не найден внутри обертки');
    }
    
    // Инициализация
    this.init();
  }

  /**
   * Генерирует обертку для input из исходного элемента
   * @param wrapperElement - исходный div элемент
   * @returns HTMLDivElement - сгенерированная обертка
   */
  private generateWrapper(wrapperElement: HTMLDivElement): HTMLDivElement {
    wrapperElement.setAttribute('data-id', `${Math.round(Math.random()*10000)}`);

    const inputElement = wrapperElement.querySelector('input[type="url"]');
    let labelElement = wrapperElement.querySelector('label');

    if (!inputElement) {
      throw new Error('Input элемент типа url не найден внутри обертки');
    }

    inputElement.classList.add('twpx-url-input__input')
    
    // Создаем обертку
    const wrapper = wrapperElement;
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'twpx-url-input-container';
    
    if (!labelElement) {
      // Создаем label
      labelElement = document.createElement('label');
      labelElement.textContent = 'Адрес портала Битрикс24';
    }
    
    labelElement.className = 'twpx-url-input-label';
    
    // Создаем иконки
    const urlIcon = document.createElement('img');
    urlIcon.className = 'twpx-url-input-icon';
    urlIcon.src = this.iconPaths.urlIcon;
    urlIcon.width = 32;
    urlIcon.height = 32;
    urlIcon.alt = '';
    
    const clearIcon = document.createElement('img');
    clearIcon.className = 'twpx-url-input-clear';
    clearIcon.src = this.iconPaths.clearIcon;
    clearIcon.width = 32;
    clearIcon.height = 32;
    clearIcon.alt = '';
    
    const clearInvalidIcon = document.createElement('img');
    clearInvalidIcon.className = 'twpx-url-input-clear-invalid';
    clearInvalidIcon.src = this.iconPaths.clearInvalidIcon;
    clearInvalidIcon.width = 32;
    clearInvalidIcon.height = 32;
    clearInvalidIcon.alt = '';
    
    const lockIcon = document.createElement('img');
    lockIcon.className = 'twpx-url-input-lock';
    lockIcon.src = this.iconPaths.lockIcon;
    lockIcon.width = 32;
    lockIcon.height = 32;
    lockIcon.alt = '';
    
    // Добавляем все элементы в контейнер
    container.appendChild(inputElement);
    container.appendChild(labelElement);
    container.appendChild(urlIcon);
    container.appendChild(clearIcon);
    container.appendChild(clearInvalidIcon);
    container.appendChild(lockIcon);
    
    // Добавляем контейнер в обертку
    wrapper.appendChild(container);
    
    return wrapper;
  }
  
  private init(): void {    
    // Проверяем начальное значение и устанавливаем класс если есть текст
    if (this.input.value.trim() !== '') {
      this.setFilledState(true);
    }

    // Настраиваем иконки
    this.setupIcons();
    
    // Добавляем обработчики событий
    this.input.addEventListener('change', this.validate.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
  }

  /**
   * Настраивает обработчики для иконок
   */
  private setupIcons(): void {
    // Обработчик для иконки очистки
    if (this.clearIcon) {
      this.clearIcon.addEventListener('click', this.handleClear.bind(this));
    }
    
    // Обработчик для иконки очистки при ошибке
    if (this.clearInvalidIcon) {
      this.clearInvalidIcon.addEventListener('click', this.handleClear.bind(this));
    }
  }
  
  // Обработчик ввода
  private handleInput(event: Event): void {
    // Обновляем класс filled в зависимости от наличия текста
    if (this.input.value.trim() !== '') {
      this.setFilledState(true);
    } else {
      this.setFilledState(false);
    }
    
    this.clearValidationState();
  }
  
  // Обработчик фокуса
  private handleFocus(event: FocusEvent): void {
    // Добавляем класс для стилизации при фокусе
    this.setFocusedState(true);
    
    // Убираем класс filled если поле пустое (CSS :placeholder-shown сам справится)
    if (this.input.value.trim() === '') {
      this.setFilledState(false);
    }
  }
  
  // Обработчик потери фокуса
  private handleBlur(event: FocusEvent): void {
    // Убираем класс focused
    this.setFocusedState(false);
    
    // Проверяем значение и добавляем класс filled если есть текст
    if (this.input.value.trim() !== '') {
      this.setFilledState(true);
    }
    
    // Валидируем при потере фокуса
    this.validate();
  }

  private handleClear(event: MouseEvent): void {
    this.reset();
    this.focus();
  }
  
  // Валидация URL
  public validate(): boolean {
    const value = this.input.value.trim();
    
    if (value === '') {
      this.clearValidationState();
      return !this.input.required; // Если поле не обязательно и пустое - валидно
    }
    
    try {
      // Создаем URL объект для валидации
      new URL(value);
      this.setInvalidState(false);
      return true;
    } catch (error) {
      this.setInvalidState(true);
      return false;
    }
  }

  private setFilledState(filled: boolean) {
    if (this.inputContainer)
      this.inputContainer.classList.toggle('filled', filled);
  }

  private setFocusedState(focused: boolean) {
    if (this.inputContainer)
      this.inputContainer.classList.toggle('focused', focused);
  }

  private setDisabledState(disabled: boolean) {
    if (this.inputContainer)
      this.inputContainer.classList.toggle('disabled', disabled);
  }
  
  // Установить состояние невалидности
  private setInvalidState(invalid: boolean): void {
    if (this.inputContainer) {
      this.inputContainer.classList.toggle('valid', !invalid);
      this.inputContainer.classList.toggle('invalid', invalid);
    }
  }
  
  // Очистить состояние валидации
  public clearValidationState(): void {
    if (this.inputContainer)
      this.inputContainer.classList.remove('valid', 'invalid');
  }
  
  // Получить значение
  public getValue(): string {
    return this.input.value.trim();
  }
  
  // Установить значение
  public setValue(value: string): void {
    this.input.value = value;
    
    // Обновляем класс filled в зависимости от наличия текста
    if (value.trim() !== '') {
      this.setFilledState(true);
    } else {
      this.setFilledState(false);
    }
    
    this.clearValidationState();
  }
  
  // Сбросить значение
  public reset(): void {
    this.input.value = '';
    this.setFilledState(false);
    this.clearValidationState();
  }
  
  // Включить/выключить поле
  public setDisabled(disabled: boolean): void {
    this.input.disabled = disabled;
    this.setDisabledState(disabled);
  }

  public setInvalid(invalid: boolean): void {
    this.setInvalidState(invalid);
  }
  
  // Проверить, валидно ли поле
  public isValid(): boolean {
    return this.validate();
  }
  
  // Установить текст лейбла
  public setLabelText(text: string): void {
    if (this.label) {
      this.label.textContent = text;
    }
  }
  
  // Установить placeholder (скрытый, для работы :placeholder-shown)
  public setPlaceholder(placeholder: string): void {
    this.input.placeholder = placeholder;
  }
  
  // Установить обязательность поля
  public setRequired(required: boolean): void {
    this.input.required = required;
  }
  
  // Получить DOM элемент input
  public getInputElement(): HTMLInputElement {
    return this.input;
  }
  
  // Получить DOM элемент wrapper
  public getWrapperElement(): HTMLDivElement {
    return this.wrapper;
  }
  
  // Фокус на поле
  public focus(): void {
    this.input.focus();
  }
  
  // Убрать фокус с поля
  public blur(): void {
    this.input.blur();
  }
  
  // Установить кастомное сообщение об ошибке
  public setCustomValidity(message: string): void {
    this.input.setCustomValidity(message);
  }
}