import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarPhotoAnalyzerComponent } from './car-photo-analyzer.component';
import { PhotoUploadService, UploadedFile } from './services/photo-upload.service';

describe('CarPhotoAnalyzerComponent', () => {
  let component: CarPhotoAnalyzerComponent;
  let fixture: ComponentFixture<CarPhotoAnalyzerComponent>;
  let mockPhotoUploadService: jasmine.SpyObj<PhotoUploadService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PhotoUploadService', [
      'processUpload',
      'formatFileSize',
      'getMaxFileSize'
    ]);

    await TestBed.configureTestingModule({
      imports: [CarPhotoAnalyzerComponent],
      providers: [
        { provide: PhotoUploadService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarPhotoAnalyzerComponent);
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

  it('should initialize with empty state', () => {
    expect(component.state.uploadedFile).toBeNull();
    expect(component.state.error).toBeNull();
  });

  describe('File Upload Handling', () => {
    it('should handle successful file upload', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };

      component.onFileUploaded(uploadedFile);

      expect(component.state.uploadedFile).toBe(uploadedFile);
      expect(component.state.error).toBeNull();
    });

    it('should handle upload error', () => {
      const errorMessage = 'Invalid file type';

      component.onUploadError(errorMessage);

      expect(component.state.error).toBe(errorMessage);
    });

    it('should clear error when file is uploaded successfully', () => {
      // Set initial error
      component.state.error = 'Previous error';
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadedFile: UploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };

      component.onFileUploaded(uploadedFile);

      expect(component.state.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      component.state.error = 'Test error';

      component.clearError();

      expect(component.state.error).toBeNull();
    });
  });

  describe('Helper Methods', () => {
    it('should return false when no file is uploaded', () => {
      expect(component.hasUploadedFile()).toBe(false);
    });

    it('should return true when file is uploaded', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      component.state.uploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };

      expect(component.hasUploadedFile()).toBe(true);
    });
  });

  describe('Template Integration', () => {
    it('should show photo upload component', () => {
      const compiled = fixture.nativeElement;
      const photoUpload = compiled.querySelector('app-photo-upload');
      
      expect(photoUpload).toBeTruthy();
    });

    it('should not show analysis section when no file is uploaded', () => {
      const compiled = fixture.nativeElement;
      const analysisSection = compiled.querySelector('.analysis-section');
      
      expect(analysisSection).toBeFalsy();
    });

    it('should show analysis section when file is uploaded', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      component.state.uploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const analysisSection = compiled.querySelector('.analysis-section');
      
      expect(analysisSection).toBeTruthy();
    });

    it('should show error message when error exists', () => {
      component.state.error = 'Test error message';
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorContainer = compiled.querySelector('.error-container');
      const errorMessage = compiled.querySelector('.error-message');
      
      expect(errorContainer).toBeTruthy();
      expect(errorMessage.textContent).toContain('Test error message');
    });

    it('should not show error message when no error exists', () => {
      const compiled = fixture.nativeElement;
      const errorContainer = compiled.querySelector('.error-container');
      
      expect(errorContainer).toBeFalsy();
    });

    it('should show preview image when file is uploaded', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      component.state.uploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const previewImage = compiled.querySelector('.preview-image');
      
      expect(previewImage).toBeTruthy();
      expect(previewImage.src).toContain('blob:test-url');
      expect(previewImage.alt).toBe('test.jpg');
    });

    it('should show file info when file is uploaded', () => {
      const file = new File(['test content'], 'my-car.jpg', { type: 'image/jpeg' });
      component.state.uploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const photoName = compiled.querySelector('.photo-name');
      const photoSize = compiled.querySelector('.photo-size');
      
      expect(photoName.textContent).toContain('my-car.jpg');
      expect(photoSize.textContent).toContain(file.size.toString());
    });

    it('should show analysis button when file is uploaded', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      component.state.uploadedFile = {
        file,
        previewUrl: 'blob:test-url',
        uploadTimestamp: new Date()
      };
      
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const analysisButton = compiled.querySelector('.analysis-button');
      
      expect(analysisButton).toBeTruthy();
      expect(analysisButton.textContent).toContain('Проверить состояние');
    });
  });
});