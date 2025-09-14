import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PhotoUploadComponent } from './photo-upload.component';
import { PhotoUploadService, UploadedFile } from '../../services/photo-upload.service';

describe('PhotoUploadComponent', () => {
  let component: PhotoUploadComponent;
  let fixture: ComponentFixture<PhotoUploadComponent>;
  let mockPhotoUploadService: jasmine.SpyObj<PhotoUploadService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PhotoUploadService', [
      'processUpload',
      'formatFileSize',
      'getMaxFileSize'
    ]);

    await TestBed.configureTestingModule({
      imports: [PhotoUploadComponent],
      providers: [
        { provide: PhotoUploadService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploadComponent);
    component = fixture.componentInstance;
    mockPhotoUploadService = TestBed.inject(PhotoUploadService) as jasmine.SpyObj<PhotoUploadService>;
    
    // Setup default mock returns
    mockPhotoUploadService.formatFileSize.and.returnValue('10 MB');
    mockPhotoUploadService.getMaxFileSize.and.returnValue(10 * 1024 * 1024);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Drag and Drop', () => {
    it('should set isDragActive to true on dragover', () => {
      const event = new DragEvent('dragover');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragActive).toBe(true);
    });

    it('should not set isDragActive when disabled', () => {
      component.disabled = true;
      const event = new DragEvent('dragover');
      spyOn(event, 'preventDefault');

      component.onDragOver(event);

      expect(component.isDragActive).toBe(false);
    });

    it('should set isDragActive to false on dragleave', () => {
      component.isDragActive = true;
      const event = new DragEvent('dragleave');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onDragLeave(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragActive).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test',
        uploadTimestamp: new Date()
      };

      mockPhotoUploadService.processUpload.and.returnValue(of(mockUploadedFile));
      spyOn(component.fileUploaded, 'emit');

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragActive).toBe(false);
      expect(mockPhotoUploadService.processUpload).toHaveBeenCalledWith(file);
    });

    it('should not handle drop when disabled', () => {
      component.disabled = true;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });
      spyOn(event, 'preventDefault');

      component.onDrop(event);

      expect(mockPhotoUploadService.processUpload).not.toHaveBeenCalled();
    });

    it('should not handle drop when processing', () => {
      component.isProcessing = true;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });

      component.onDrop(event);

      expect(mockPhotoUploadService.processUpload).not.toHaveBeenCalled();
    });
  });

  describe('File Selection', () => {
    it('should handle file selection from input', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test',
        uploadTimestamp: new Date()
      };

      mockPhotoUploadService.processUpload.and.returnValue(of(mockUploadedFile));
      spyOn(component.fileUploaded, 'emit');

      const input = document.createElement('input');
      input.type = 'file';
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const event = { target: input } as any;

      component.onFileSelected(event);

      expect(mockPhotoUploadService.processUpload).toHaveBeenCalledWith(file);
    });

    it('should reset input value after file selection', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test',
        uploadTimestamp: new Date()
      };

      mockPhotoUploadService.processUpload.and.returnValue(of(mockUploadedFile));

      const input = document.createElement('input');
      input.type = 'file';
      input.value = 'test.jpg';
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const event = { target: input } as any;

      component.onFileSelected(event);

      expect(input.value).toBe('');
    });

    it('should trigger file input click on upload button click', () => {
      const mockFileInput = document.createElement('input');
      spyOn(document, 'getElementById').and.returnValue(mockFileInput);
      spyOn(mockFileInput, 'click');

      component.onUploadButtonClick();

      expect(document.getElementById).toHaveBeenCalledWith('fileInput');
      expect(mockFileInput.click).toHaveBeenCalled();
    });
  });

  describe('File Processing', () => {
    it('should emit fileUploaded on successful upload', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test',
        uploadTimestamp: new Date()
      };

      mockPhotoUploadService.processUpload.and.returnValue(of(mockUploadedFile));
      spyOn(component.fileUploaded, 'emit');

      component['handleFile'](file);

      expect(component.isProcessing).toBe(false);
      expect(component.fileUploaded.emit).toHaveBeenCalledWith(mockUploadedFile);
    });

    it('should emit uploadError on failed upload', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const errorMessage = 'Invalid file type';

      mockPhotoUploadService.processUpload.and.returnValue(
        throwError(() => new Error(errorMessage))
      );
      spyOn(component.uploadError, 'emit');

      component['handleFile'](file);

      expect(component.isProcessing).toBe(false);
      expect(component.uploadError.emit).toHaveBeenCalledWith(errorMessage);
    });

    it('should set isProcessing during upload', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test',
        uploadTimestamp: new Date()
      };

      mockPhotoUploadService.processUpload.and.returnValue(of(mockUploadedFile));

      expect(component.isProcessing).toBe(false);
      
      component['handleFile'](file);
      
      // After processing completes
      expect(component.isProcessing).toBe(false);
    });

    it('should not process file when disabled', () => {
      component.disabled = true;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      component['handleFile'](file);

      expect(mockPhotoUploadService.processUpload).not.toHaveBeenCalled();
    });

    it('should not process file when already processing', () => {
      component.isProcessing = true;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      component['handleFile'](file);

      expect(mockPhotoUploadService.processUpload).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should return formatted max file size', () => {
      const result = component.getMaxFileSizeFormatted();
      
      expect(mockPhotoUploadService.formatFileSize).toHaveBeenCalledWith(10 * 1024 * 1024);
      expect(result).toBe('10 MB');
    });

    it('should return allowed types text', () => {
      const result = component.getAllowedTypesText();
      
      expect(result).toBe('JPG, JPEG, PNG');
    });
  });

  describe('Template Integration', () => {
    it('should display hero title', () => {
      const compiled = fixture.nativeElement;
      const heroTitle = compiled.querySelector('.hero-title');
      
      expect(heroTitle.textContent).toContain('Анализ');
      expect(heroTitle.textContent).toContain('фото');
      expect(heroTitle.textContent).toContain('автомобилей');
    });

    it('should display upload instructions', () => {
      const compiled = fixture.nativeElement;
      const subtitle = compiled.querySelector('.hero-subtitle');
      
      expect(subtitle.textContent).toContain('Загрузите фото → нажмите кнопку → получите результат');
    });

    it('should show upload button', () => {
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('.upload-button');
      
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Загрузить фото');
    });

    it('should disable button when disabled input is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('.upload-button');
      
      expect(button.disabled).toBe(true);
    });

    it('should show processing state', () => {
      component.isProcessing = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('.upload-button');
      const uploadTitle = compiled.querySelector('.upload-title');
      
      expect(button.textContent).toContain('Обработка...');
      expect(uploadTitle.textContent).toContain('Обработка файла...');
    });

    it('should apply drag-active class when dragging', () => {
      component.isDragActive = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const uploadZone = compiled.querySelector('.upload-zone');
      
      expect(uploadZone.classList).toContain('drag-active');
    });
  });
});