// exif-remover.js - EXIF metadata removal and image conversion

class ExifRemover {
    constructor() {
        this.processedFiles = [];
    }

    // Основная функция обработки файлов
    async processFiles(files) {
        const results = [];
        
        for (const file of files) {
            try {
                const result = await this.processFile(file);
                results.push(result);
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                results.push({
                    success: false,
                    originalName: file.name,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    // Обработка одного файла
    async processFile(file) {
        // Проверка типа файла
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        
        // HEIC конвертация - проверяем и по расширению и по MIME типу
        if (fileName.endsWith('.heic') || 
            fileName.endsWith('.heif') || 
            fileType === 'image/heic' || 
            fileType === 'image/heif' ||
            fileType === 'image/heic-sequence' ||
            fileType === 'image/heif-sequence') {
            return await this.convertHeicToJpeg(file);
        }
        
        // Обработка обычных изображений
        if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
            return await this.removeExifData(file);
        }
        
        throw new Error('Неподдерживаемый формат файла');
    }

    // Конвертация HEIC в JPEG
    async convertHeicToJpeg(file) {
        try {
            // Используем heic2any library для конвертации
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.95
            });
            
            // heic2any может вернуть массив blob'ов, берем первый
            const blobToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            
            // Создаем новое изображение без метаданных
            const cleanBlob = await this.processImageBlob(blobToProcess);
            
            return {
                success: true,
                originalName: file.name,
                cleanFileName: file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                originalSize: file.size,
                cleanSize: cleanBlob.size,
                blob: cleanBlob,
                converted: true,
                metadataRemoved: ['EXIF', 'GPS', 'IPTC', 'XMP', 'ICC Profile', 'HEIC Metadata']
            };
        } catch (error) {
            console.error('HEIC conversion error:', error);
            throw new Error('Не удалось конвертировать HEIC. Убедитесь, что браузер поддерживает этот формат.');
        }
    }

    // Удаление EXIF данных из изображения
    async removeExifData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const img = new Image();
                    img.onload = async () => {
                        try {
                            // Создаем canvas для очистки
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            
                            // Конвертируем в blob без метаданных
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    resolve({
                                        success: true,
                                        originalName: file.name,
                                        cleanFileName: this.getCleanFileName(file.name),
                                        originalSize: file.size,
                                        cleanSize: blob.size,
                                        blob: blob,
                                        converted: false,
                                        metadataRemoved: ['EXIF', 'GPS', 'IPTC', 'Thumbnail', 'Color Profile']
                                    });
                                } else {
                                    reject(new Error('Ошибка создания изображения'));
                                }
                            }, 'image/jpeg', 0.95);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    
                    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsDataURL(file);
        });
    }

    // Обработка blob изображения
    async processImageBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((cleanBlob) => {
                        if (cleanBlob) {
                            resolve(cleanBlob);
                        } else {
                            reject(new Error('Ошибка создания blob'));
                        }
                    }, 'image/jpeg', 0.95);
                };
                img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения blob'));
            reader.readAsDataURL(blob);
        });
    }

    // Получить имя очищенного файла
    getCleanFileName(originalName) {
        const nameParts = originalName.split('.');
        const extension = nameParts.pop();
        const baseName = nameParts.join('.');
        
        // Всегда сохраняем как JPEG
        return `${baseName}_clean.jpg`;
    }

    // Скачать файл
    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Скачать все файлы как ZIP (опционально)
    async downloadAsZip(results) {
        // Требует библиотеку JSZip
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded');
        }

        const zip = new JSZip();
        
        results.forEach((result, index) => {
            if (result.success) {
                zip.file(result.cleanFileName, result.blob);
            }
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(zipBlob, 'cleaned_images.zip');
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExifRemover;
}
