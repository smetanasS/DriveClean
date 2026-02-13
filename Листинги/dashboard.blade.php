<x-main.layout>
    <div class="main-wrapper">
        <div class="card">
            <header class="header">
                <div class="logo">
                    <div class="logo-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%"
                                    y2="100%">
                                    <stop offset="0%" style="stop-color:#2E8BC0;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#5DC862;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M50 10 L20 25 L20 50 Q20 75 50 90 Q80 75 80 50 L80 25 Z"
                                fill="url(#shieldGradient)" opacity="0.9" />
                            <ellipse cx="35" cy="40" rx="8" ry="6" fill="white"
                                opacity="0.9" />
                            <ellipse cx="42" cy="38" rx="7" ry="7" fill="white"
                                opacity="0.9" />
                            <ellipse cx="48" cy="40" rx="6" ry="5" fill="white"
                                opacity="0.9" />
                            <rect x="38" y="42" width="18" height="14" rx="2" fill="white"
                                stroke="#2E8BC0" stroke-width="1.5" />
                            <circle cx="44" cy="49" r="4" fill="none" stroke="#2E8BC0"
                                stroke-width="1.5" />
                            <line x1="44" y1="49" x2="47" y2="52" stroke="#2E8BC0"
                                stroke-width="1.5" />
                            <line x1="40" y1="44" x2="52" y2="44" stroke="#2E8BC0"
                                stroke-width="1" />
                            <line x1="58" y1="38" x2="68" y2="48" stroke="white"
                                stroke-width="2.5" stroke-linecap="round" />
                            <path d="M67 48 L65 54 Q63 58 60 58 Q57 58 55 54 L53 48" fill="#5DC862" stroke="white"
                                stroke-width="1" />
                            <circle cx="46" cy="62" r="1.5" fill="#5DC862" opacity="0.8" />
                            <circle cx="52" cy="65" r="1" fill="#5DC862" opacity="0.6" />
                            <circle cx="42" cy="66" r="1" fill="#2E8BC0" opacity="0.7" />
                            <circle cx="48" cy="68" r="1.2" fill="#5DC862" opacity="0.7" />
                        </svg>
                    </div>
                    <span class="logo-text">DriveClean</span>
                </div>
                <nav class="nav-menu">
                    <a href="{{ route('dashboard') }}" class="active">Личный кабинет</a>
                    <a href="{{ route('how_it_works') }}">Как это работает?</a>
                    <a href="{{ route('social') }}">Социальные сети</a>
                    @if (auth()->user()->is_admin)
                        <a href="{{ route('admin.dashboard') }}">📊 Статистика</a>
                    @endif
                </nav>
                <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn-login">Выход</button>
                </form>
            </header>
            <main class="content content-page">
                <div class="dashboard-header">
                    <div>
                        <h1 class="page-title" style="text-align: left; margin-bottom: 10px;">
                            Добро пожаловать, <span>{{ $user->name }}</span>!
                        </h1>
                        <p class="dashboard-subtitle">Управляйте своими файлами и просматривайте статистику</p>
                    </div>
                </div>

                @if (session('success'))
                    <div
                        style="background: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
                        {{ session('success') }}
                    </div>
                @endif

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ $totalFiles }}</div>
                            <div class="stat-label">Всего очищено файлов</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ $todayFiles }}</div>
                            <div class="stat-label">Очищено сегодня</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ \App\Models\CleanedFile::formatSize($totalSize) }}</div>
                            <div class="stat-label">Общий размер файлов</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <polyline points="17 11 19 13 23 9"></polyline>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ $memberSince }}</div>
                            <div class="stat-label">Дата регистрации</div>
                        </div>
                    </div>
                </div>

                {{-- Загрузка файлов --}}
                <div class="dashboard-section">
                    <h2 class="section-title">Очистка файлов</h2>
                    <form method="POST" action="{{ route('dashboard.upload') }}" enctype="multipart/form-data"
                        id="uploadForm">
                        @csrf
                        <div class="upload-zone-dashboard" id="uploadZone">
                            <div class="icon-broom">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                    stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M20 4L12 12"></path>
                                    <path d="M10 14L4 20C4 20 6 22 8 22C10 22 12 20 12 20L18 14"></path>
                                    <path d="M16 8L16.01 8"></path>
                                    <path d="M13 11L13.01 11"></path>
                                </svg>
                            </div>
                            <p class="upload-text">
                                Перетащите сюда файлы или
                                <a href="#" class="upload-link-dashboard"
                                    onclick="event.preventDefault(); document.getElementById('fileInput').click();">
                                    выберите на вашем компьютере
                                </a>
                            </p>
                            <p class="upload-formats">JPG, PNG, WEBP, HEIC, HEIF, BMP, GIF</p>
                            <input type="file" id="fileInput" name="files[]" multiple
                                accept="image/*,.heic,.heif" style="display: none;">
                        </div>

                        @error('files.*')
                            <p style="color: #e74c3c; margin-top: 8px;">{{ $message }}</p>
                        @enderror

                        {{-- Превью выбранных файлов --}}
                        <div id="previewSection" style="display: none; margin-top: 20px;">
                            <div
                                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <p style="color: #2c3e50; font-weight: 600; margin: 0;">
                                    Выбрано файлов: <span id="fileCount">0</span>
                                </p>
                                <button type="button" id="clearBtn"
                                    style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.9rem;">
                                    ✕ Очистить
                                </button>
                            </div>
                            <div id="previewGrid"></div>
                            <button type="submit" class="btn-submit" style="margin-top: 15px;">Очистить
                                файлы</button>
                        </div>
                    </form>
                </div>

                {{-- История --}}
                <div class="dashboard-section">
                    <h2 class="section-title">История очистки</h2>
                    <div class="history-container">
                        @if ($history->isEmpty())
                            <p class="empty-state">История пуста. Очистите первый файл!</p>
                        @else
                            <div class="history-list">
                                @foreach ($history as $file)
                                    <div class="history-item">
                                        {{-- Стало: превью фото --}}
                                        <div class="history-thumb">
                                            <img src="{{ asset('storage/' . $file->storage_path) }}"
                                                alt="{{ $file->original_name }}">
                                        </div>
                                        <div class="history-details">
                                            <div class="history-filename">{{ $file->original_name }}</div>
                                            <div class="history-meta">
                                                <span>{{ \App\Models\CleanedFile::formatSize($file->original_size) }}</span>
                                                <span>•</span>
                                                <span>{{ $file->russianDate() }}</span>
                                            </div>
                                            @if ($file->metadata_removed && count($file->metadata_removed) > 0)
                                                <div class="metadata-tags">
                                                    @foreach ($file->metadata_removed as $tag)
                                                        <span class="metadata-tag">{{ $tag }}</span>
                                                    @endforeach
                                                </div>
                                            @endif
                                        </div>
                                        <a href="{{ route('dashboard.download', $file->id) }}" class="download-btn"
                                            title="Скачать очищенный файл">
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3">
                                                </line>
                                            </svg>
                                        </a>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            </main>
        </div>
        <div class="footer-timestamp">
            © 2025 DriveClean
        </div>
    </div>

    <style>
        .history-thumb {
            width: 56px;
            height: 56px;
            min-width: 56px;
            border-radius: 8px;
            overflow: hidden;
            background: #eee;
        }

        .history-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        #previewGrid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 12px;
        }

        .preview-item {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
            background: #f9f9f9;
        }

        .preview-item img {
            width: 100%;
            height: 110px;
            object-fit: cover;
            display: block;
        }

        .preview-item .preview-name {
            padding: 5px 8px 2px;
            font-size: 0.75rem;
            color: #444;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .preview-item .preview-size {
            padding: 0 8px 6px;
            font-size: 0.7rem;
            color: #999;
        }

        .preview-item .preview-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 22px;
            height: 22px;
            background: rgba(0, 0, 0, 0.55);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            line-height: 22px;
            text-align: center;
            padding: 0;
            transition: background 0.2s;
        }

        .preview-item .preview-remove:hover {
            background: rgba(231, 76, 60, 0.9);
        }

        .preview-placeholder {
            width: 100%;
            height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eaeaea;
            color: #888;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .download-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            min-width: 38px;
            border-radius: 8px;
            background: linear-gradient(135deg, #2E8BC0, #5DC862);
            color: white;
            text-decoration: none;
            transition: opacity 0.2s;
        }

        .download-btn:hover {
            opacity: 0.8;
        }

        .download-btn svg {
            stroke: white;
        }

        .history-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .history-details {
            flex: 1;
        }
    </style>

    <script>
        const fileInput = document.getElementById('fileInput');
        const uploadZone = document.getElementById('uploadZone');
        const previewSection = document.getElementById('previewSection');
        const previewGrid = document.getElementById('previewGrid');
        const fileCountEl = document.getElementById('fileCount');
        const clearBtn = document.getElementById('clearBtn');

        let fileStore = new DataTransfer();

        fileInput.addEventListener('change', function() {
            for (const file of this.files) {
                fileStore.items.add(file);
            }
            syncFiles();
        });

        clearBtn.addEventListener('click', function() {
            fileStore = new DataTransfer();
            syncFiles();
        });

        function syncFiles() {
            fileInput.files = fileStore.files;
            renderPreviews();
        }

        function removeFile(index) {
            const dt = new DataTransfer();
            for (let i = 0; i < fileStore.files.length; i++) {
                if (i !== index) dt.items.add(fileStore.files[i]);
            }
            fileStore = dt;
            syncFiles();
        }

        function formatSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
        }

        function renderPreviews() {
            const files = fileStore.files;
            previewGrid.innerHTML = '';

            if (files.length === 0) {
                previewSection.style.display = 'none';
                return;
            }

            previewSection.style.display = 'block';
            fileCountEl.textContent = files.length;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const item = document.createElement('div');
                item.className = 'preview-item';

                // Кнопка удаления
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'preview-remove';
                removeBtn.textContent = '✕';
                removeBtn.onclick = () => removeFile(i);
                item.appendChild(removeBtn);

                // Превью
                if (file.type.startsWith('image/') && !file.name.match(/\.(heic|heif)$/i)) {
                    const img = document.createElement('img');
                    img.alt = file.name;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                    item.appendChild(img);
                } else {
                    const ph = document.createElement('div');
                    ph.className = 'preview-placeholder';
                    ph.textContent = file.name.match(/\.(heic|heif)$/i) ? 'HEIC' : (file.type.split('/')[1] || 'FILE')
                        .toUpperCase();
                    item.appendChild(ph);
                }

                // Имя файла
                const nameEl = document.createElement('div');
                nameEl.className = 'preview-name';
                nameEl.textContent = file.name;
                nameEl.title = file.name;
                item.appendChild(nameEl);

                // Размер
                const sizeEl = document.createElement('div');
                sizeEl.className = 'preview-size';
                sizeEl.textContent = formatSize(file.size);
                item.appendChild(sizeEl);

                previewGrid.appendChild(item);
            }
        }

        // Drag & drop
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--green-btn, #5DC862)';
            this.style.backgroundColor = 'rgba(93, 200, 98, 0.1)';
        });
        uploadZone.addEventListener('dragleave', function() {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.backgroundColor = '';
            for (const file of e.dataTransfer.files) {
                fileStore.items.add(file);
            }
            syncFiles();
        });
    </script>
</x-main.layout>
