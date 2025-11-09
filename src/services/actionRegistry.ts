import type { ButtonAction } from '@cleverence/shared-schema';

/**
 * Реестр действий для кнопок
 * Связывает действия из схемы с реальными функциями приложения
 */
export class ActionRegistry {
  private navigate: (path: string) => void;

  constructor(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  /**
   * Выполнить действие
   */
  execute(action: ButtonAction, params?: Record<string, any>) {
    console.log('🎯 Executing action:', action, 'with params:', params);

    const handlers: Record<ButtonAction, () => void> = {
      none: () => {
        console.log('ℹ️ No action assigned to this button');
      },

      scan_barcode: () => {
        this.openScanner();
      },

      open_document_list: () => {
        if (params?.docType) {
          this.navigate(`/docs/${params.docType}`);
        } else {
          this.navigate('/documents');
        }
      },

      open_form: () => {
        if (params?.formType) {
          this.navigate(`/form/${params.formType}`);
        } else {
          this.navigate('/');
        }
      },

      navigate_to: () => {
        const path = params?.path || '/';
        this.navigate(path);
      },

      submit_data: () => {
        this.submitData();
      },

      navigate_back: () => {
        window.history.back();
      },

      print_label: () => {
        this.printLabel();
      },

      take_photo: () => {
        this.takePhoto();
      },

      search: () => {
        this.navigate('/search');
      },

      filter: () => {
        this.openFilter();
      },

      refresh: () => {
        window.location.reload();
      },
    };

    const handler = handlers[action];
    if (handler) {
      handler();
    } else {
      console.warn('⚠️ Unknown action:', action);
    }
  }

  /**
   * Открыть сканер штрихкодов
   */
  private openScanner() {
    // Используем существующий функционал сканирования
    console.log('📱 Opening barcode scanner');
    // Можно использовать существующий компонент ScannerInput
    // или перейти на специальную страницу сканирования
    this.navigate('/receiving'); // Например, страница приёмки имеет сканер
  }

  /**
   * Отправить данные
   */
  private submitData() {
    console.log('📤 Submitting data');
    // Логика отправки данных на сервер
    alert('Данные отправлены!');
  }

  /**
   * Печать этикетки
   */
  private printLabel() {
    console.log('🖨️ Printing label');
    // Логика печати этикетки
    alert('Печать этикетки...');
  }

  /**
   * Сделать фото
   */
  private takePhoto() {
    console.log('📸 Taking photo');
    // Логика захвата фото с камеры
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          console.log('Camera access granted');
          // Здесь можно открыть компонент для фото
          alert('Камера готова к съёмке');
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.error('Camera access denied:', err);
          alert('Нет доступа к камере');
        });
    } else {
      alert('Камера недоступна на этом устройстве');
    }
  }

  /**
   * Открыть фильтры
   */
  private openFilter() {
    console.log('🔍 Opening filter');
    // Логика открытия панели фильтров
    alert('Открытие фильтров...');
  }
}

