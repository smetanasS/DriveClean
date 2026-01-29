// metadata-viewer.js - Интерфейс для просмотра и выборочного удаления метаданных

let currentFile = null;
let currentMetadata = null;
let selectedMetadata = new Set();

const exifReader = new ExifReader();
const exifRemover = new ExifRemover();

// Элементы интерфейса
const uploadZone = document.getElementById('metadataUploadZone');
const uploadLink = document.getElementById('metadataUploadLink');
const fileInput = document.getElementById('metadataFileInput');
const metadataViewer = document.getElementById('metadataViewer');

// Обработчики загрузки
uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileLoad(e.target.files[0]);
    }
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--green-btn)';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--border-dash)';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--border-dash)';
    
    if (e.dataTransfer.files.length > 0) {
        handleFileLoad(e.dataTransfer.files[0]);
    }
});

// Загрузка и анализ файла
async function handleFileLoad(file) {
    currentFile = file;
    
    // Показать информацию о файле
    document.getElementById('currentFileName').textContent = file.name;
    document.getElementById('currentFileSize').textContent = formatFileSize(file.size);
    
    try {
        // Читаем метаданные
        currentMetadata = await exifReader.readMetadata(file);
        
        if (!currentMetadata.hasMetadata || Object.values(currentMetadata.categories).every(cat => cat.length === 0)) {
            alert('⚠️ В этом файле не обнаружено метаданных EXIF');
            return;
        }
        
        // Отображаем метаданные
        displayMetadata();
        
        // Показываем viewer
        uploadZone.style.display = 'none';
        metadataViewer.style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка чтения метаданных:', error);
        alert('Ошибка чтения метаданных: ' + error.message);
    }
}

// Отображение метаданных
function displayMetadata() {
    const categoriesContainer = document.getElementById('metadataCategories');
    const listContainer = document.getElementById('metadataList');
    
    categoriesContainer.innerHTML = '';
    listContainer.innerHTML = '';
    
    // Получаем категории с данными
    const categories = exifReader.getCategoriesWithData(currentMetadata);
    
    if (categories.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Метаданные не найдены</p>';
        return;
    }
    
    // Отображаем категории
    categories.forEach(category => {
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'metadata-category-btn active';
        categoryBtn.innerHTML = `
            <span>${category.label}</span>
            <span class="category-count">${category.count}</span>
        `;
        categoryBtn.onclick = () => filterByCategory(category.name);
        categoriesContainer.appendChild(categoryBtn);
    });
    
    // Отображаем все метаданные
    displayAllMetadata();
    
    // По умолчанию выбираем критичные метаданные (GPS, даты, камера)
    selectCriticalMetadata();
}

// Отображение всех метаданных
function displayAllMetadata() {
    const listContainer = document.getElementById('metadataList');
    listContainer.innerHTML = '';
    
    Object.keys(currentMetadata.categories).forEach(categoryName => {
        const items = currentMetadata.categories[categoryName];
        
        if (items.length > 0) {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'metadata-category-header';
            categoryHeader.textContent = getCategoryLabel(categoryName);
            listContainer.appendChild(categoryHeader);
            
            items.forEach((item, index) => {
                const itemId = `${categoryName}-${index}`;
                const itemEl = createMetadataItem(item, itemId);
                listContainer.appendChild(itemEl);
            });
        }
    });
    
    updateSelectedCount();
}

// Создание элемента метаданных
function createMetadataItem(item, id) {
    const div = document.createElement('div');
    div.className = 'metadata-item';
    
    const isSelected = selectedMetadata.has(id);
    const criticalClass = item.critical ? 'critical' : '';
    
    div.innerHTML = `
        <label class="metadata-checkbox">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleMetadata('${id}')">
            <div class="metadata-item-content ${criticalClass}">
                <div class="metadata-item-header">
                    <span class="metadata-key">${item.key}</span>
                    <span class="metadata-tag">${item.tag}</span>
                    ${item.critical ? '<span class="badge-critical">Важно!</span>' : ''}
                </div>
                <div class="metadata-value">${item.value}</div>
            </div>
        </label>
    `;
    
    return div;
}

// Получить метку категории
function getCategoryLabel(categoryName) {
    const labels = {
        'location': '📍 Геолокация',
        'camera': '📷 Камера',
        'datetime': '🕐 Дата и время',
        'technical': '⚙️ Технические параметры',
        'other': '📝 Прочее'
    };
    return labels[categoryName] || categoryName;
}

// Переключение метаданных
function toggleMetadata(id) {
    if (selectedMetadata.has(id)) {
        selectedMetadata.delete(id);
    } else {
        selectedMetadata.add(id);
    }
    updateSelectedCount();
}

// Выбрать критичные метаданные
function selectCriticalMetadata() {
    selectedMetadata.clear();
    
    Object.keys(currentMetadata.categories).forEach(categoryName => {
        currentMetadata.categories[categoryName].forEach((item, index) => {
            if (item.critical) {
                selectedMetadata.add(`${categoryName}-${index}`);
            }
        });
    });
    
    // Обновить чекбоксы
    document.querySelectorAll('.metadata-item input[type="checkbox"]').forEach(checkbox => {
        const id = checkbox.onchange.toString().match(/'([^']+)'/)[1];
        checkbox.checked = selectedMetadata.has(id);
    });
    
    updateSelectedCount();
}

// Выбрать все
document.getElementById('selectAllBtn').addEventListener('click', () => {
    selectedMetadata.clear();
    
    Object.keys(currentMetadata.categories).forEach(categoryName => {
        currentMetadata.categories[categoryName].forEach((item, index) => {
            selectedMetadata.add(`${categoryName}-${index}`);
        });
    });
    
    document.querySelectorAll('.metadata-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    updateSelectedCount();
});

// Снять все
document.getElementById('deselectAllBtn').addEventListener('click', () => {
    selectedMetadata.clear();
    
    document.querySelectorAll('.metadata-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateSelectedCount();
});

// Обновить счетчик выбранных
function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = selectedMetadata.size;
}

// Очистить и скачать
document.getElementById('cleanSelectedBtn').addEventListener('click', async () => {
    if (selectedMetadata.size === 0) {
        alert('Выберите хотя бы один элемент для удаления');
        return;
    }
    
    if (!currentFile) {
        alert('Файл не загружен');
        return;
    }
    
    try {
        // Если выбраны ВСЕ метаданные, используем обычный метод
        const totalMetadata = Object.values(currentMetadata.categories).reduce((sum, cat) => sum + cat.length, 0);
        
        if (selectedMetadata.size === totalMetadata) {
            // Полная очистка
            const result = await exifRemover.processFile(currentFile);
            if (result.success) {
                exifRemover.downloadFile(result.blob, result.cleanFileName);
                alert('✅ Все метаданные удалены! Файл загружен.');
            }
        } else {
            // Частичная очистка - просто полная очистка с предупреждением
            alert('⚠️ Частичное удаление метаданных невозможно с помощью Canvas API.\n\nБудут удалены ВСЕ метаданные.');
            const result = await exifRemover.processFile(currentFile);
            if (result.success) {
                exifRemover.downloadFile(result.blob, result.cleanFileName);
            }
        }
        
        // Сбросить viewer
        resetMetadataViewer();
        
    } catch (error) {
        console.error('Ошибка очистки:', error);
        alert('Ошибка очистки: ' + error.message);
    }
});

// Сброс viewer
function resetMetadataViewer() {
    currentFile = null;
    currentMetadata = null;
    selectedMetadata.clear();
    
    metadataViewer.style.display = 'none';
    uploadZone.style.display = 'flex';
    
    fileInput.value = '';
}

// Форматирование размера
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Сделать функцию глобальной
window.toggleMetadata = toggleMetadata;
window.resetMetadataViewer = resetMetadataViewer;
