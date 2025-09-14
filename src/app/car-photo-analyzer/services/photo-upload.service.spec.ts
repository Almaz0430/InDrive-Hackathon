import { TestBed } from '@angular/core/testing';
import { PhotoUploadService, ValidationResult, UploadedFile } from './photo-upload.service';

describe('PhotoUploadService', () => {
  let service: PhotoUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateFile', () => {
    it('should validate a valid JPEG file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate a valid PNG file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate a valid JPG file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject unsupported file types', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Поддерживаются только файлы .jpg, .jpeg, .png');
    });

    it('should reject files without proper extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'image/jpeg' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Файл должен иметь расширение .jpg, .jpeg или .png');
    });

    it('should reject files larger than 10MB', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join(''); // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Размер файла не должен превышать 10MB');
    });

    it('should handle multiple validation errors', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join(''); // 11MB
      const file = new File([largeContent], 'large.gif', { type: 'image/gif' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Поддерживаются только файлы .jpg, .jpeg, .png');
      expect(result.errors).toContain('Размер файла не должен превышать 10MB');
    });

    it('should handle case insensitive file extensions', () => {
      const file = new File(['test'], 'test.JPG', { type: 'image/jpeg' });
      const result: ValidationResult = service.validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('createPreviewUrl', () => {
    it('should create a preview URL for a file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock URL.createObjectURL
      const mockUrl = 'blob:http://localhost/test-url';
      spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
      
      const previewUrl = service.createPreviewUrl(file);
      
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(previewUrl).toBe(mockUrl);
    });
  });

  describe('processUpload', () => {
    it('should successfully process a valid file', (done) => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUrl = 'blob:http://localhost/test-url';
      
      spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
      
      service.processUpload(file).subscribe({
        next: (uploadedFile: UploadedFile) => {
          expect(uploadedFile.file).toBe(file);
          expect(uploadedFile.previewUrl).toBe(mockUrl);
          expect(uploadedFile.uploadTimestamp).toBeInstanceOf(Date);
          done();
        },
        error: () => {
          fail('Should not have errored');
          done();
        }
      });
    });

    it('should reject invalid files', (done) => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      
      service.processUpload(file).subscribe({
        next: () => {
          fail('Should not have succeeded');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Поддерживаются только файлы .jpg, .jpeg, .png');
          done();
        }
      });
    });

    it('should handle createObjectURL errors', (done) => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      spyOn(URL, 'createObjectURL').and.throwError('Mock error');
      
      service.processUpload(file).subscribe({
        next: () => {
          fail('Should not have succeeded');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Не удалось загрузить файл. Попробуйте другой.');
          done();
        }
      });
    });
  });

  describe('revokePreviewUrl', () => {
    it('should revoke a preview URL', () => {
      const mockUrl = 'blob:http://localhost/test-url';
      
      spyOn(URL, 'revokeObjectURL');
      
      service.revokePreviewUrl(mockUrl);
      
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe('getAllowedTypes', () => {
    it('should return allowed file types', () => {
      const allowedTypes = service.getAllowedTypes();
      
      expect(allowedTypes).toEqual(['image/jpeg', 'image/jpg', 'image/png']);
    });

    it('should return a copy of allowed types array', () => {
      const allowedTypes1 = service.getAllowedTypes();
      const allowedTypes2 = service.getAllowedTypes();
      
      expect(allowedTypes1).not.toBe(allowedTypes2);
      expect(allowedTypes1).toEqual(allowedTypes2);
    });
  });

  describe('getMaxFileSize', () => {
    it('should return maximum file size', () => {
      const maxSize = service.getMaxFileSize();
      
      expect(maxSize).toBe(10 * 1024 * 1024); // 10MB
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(service.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format partial sizes correctly', () => {
      expect(service.formatFileSize(1536)).toBe('1.5 KB'); // 1.5KB
      expect(service.formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB'); // 2.5MB
    });

    it('should handle large numbers', () => {
      const result = service.formatFileSize(5.7 * 1024 * 1024);
      expect(result).toBe('5.7 MB');
    });
  });
});