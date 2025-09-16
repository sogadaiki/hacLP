    document.addEventListener('DOMContentLoaded', function() {
        // スムーススクロール
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // フェードインアニメーション
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // フェードイン要素を監視
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // セミナーチラシポップアップモーダルの処理
        const seminarModal = document.getElementById('seminarModal');
        const modalClose = document.getElementById('modalClose');
        const modalTitle = document.getElementById('modalTitle');
        const modalImage = document.getElementById('modalImage');
        const modalApplyLink = document.getElementById('modalApplyLink');
        
        // セミナー情報
        const seminarInfo = {
            july: {
                title: '2025年7月29日（火）「障害年金とこれからの暮らし」',
                image: 'images/seminar_july.jpg',
                applyUrl: '#' // 過去のセミナーのため
            },
            september: {
                title: '2025年9月9日（火）「これから輝くあなたへの話」',
                image: 'images/seminar_september.jpg',
                applyUrl: 'https://forms.gle/BjvxksbC8xXWMRRz9'
            },
            october: {
                title: '2025年10月28日（火）「その訓練"己満足"で終わってない？」',
                image: 'images/seminar_october.jpg',
                applyUrl: '#' // 申し込みフォームのURLが決まったら変更
            }
        };
        
        // セミナー申し込みボタンの処理
        document.querySelectorAll('.seminar-apply-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const seminarType = this.dataset.seminar;
                
                if (seminarType && seminarInfo[seminarType]) {
                    const info = seminarInfo[seminarType];
                    
                    // モーダルに情報を設定
                    modalTitle.textContent = info.title;
                    modalImage.src = info.image;
                    modalApplyLink.href = info.applyUrl;
                    
                    // セミナーごとにボタンの表示を切り替え
                    if (seminarType === 'july') {
                        // 7月は過去のセミナーなので申し込みボタンを非表示
                        modalApplyLink.style.display = 'none';
                    } else if (seminarType === 'september') {
                        modalApplyLink.style.display = 'inline-block';
                        modalApplyLink.textContent = '申し込みフォームへ';
                        modalApplyLink.style.background = 'linear-gradient(45deg, rgb(248, 171, 48) 0%, rgb(229, 81, 189) 100%)';
                        modalApplyLink.style.pointerEvents = 'auto';
                        modalApplyLink.style.cursor = 'pointer';
                        modalApplyLink.removeAttribute('onclick');
                    } else if (seminarType === 'october') {
                        modalApplyLink.style.display = 'inline-block';
                        modalApplyLink.textContent = '準備中';
                        modalApplyLink.style.background = '#ccc';
                        modalApplyLink.style.pointerEvents = 'none';
                        modalApplyLink.style.cursor = 'not-allowed';
                        modalApplyLink.href = '#';
                        modalApplyLink.onclick = function(e) { e.preventDefault(); };
                    }
                    
                    // モーダルを表示
                    seminarModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // モーダルを閉じる
        modalClose.addEventListener('click', function() {
            seminarModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // モーダル外クリックで閉じる
        seminarModal.addEventListener('click', function(e) {
            if (e.target === seminarModal) {
                seminarModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // CSRFトークン生成（簡易版）
        function generateCSRFToken() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        
        // ページ読み込み時にCSRFトークンを設定
        window.addEventListener('DOMContentLoaded', function() {
            const csrfToken = generateCSRFToken();
            const csrfField = document.getElementById('csrfToken');
            if (csrfField) {
                csrfField.value = csrfToken;
                sessionStorage.setItem('csrfToken', csrfToken);
            }
        });
        
        // 入力値のサニタイズ
        function sanitizeInput(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        }
        
        // フォーム送信処理
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // CSRFトークン検証
                const formToken = document.getElementById('csrfToken').value;
                const sessionToken = sessionStorage.getItem('csrfToken');

                if (!formToken || formToken !== sessionToken) {
                    alert('セキュリティエラー：ページをリロードしてください。');
                    location.reload();
                    return;
                }

                // 要素の存在確認
                const nameEl = document.getElementById('name');
                const phoneEl = document.getElementById('phone');
                const emailEl = document.getElementById('email');
                const situationEl = document.getElementById('situation');
                const messageEl = document.getElementById('message');

                if (!nameEl || !phoneEl || !situationEl || !messageEl) {
                    console.error('フォーム要素が見つかりません:', {
                        name: !!nameEl,
                        phone: !!phoneEl,
                        email: !!emailEl,
                        situation: !!situationEl,
                        message: !!messageEl
                    });
                    return;
                }

                // 入力値の取得とサニタイズ（安全にアクセス）
                const name = nameEl.value ? sanitizeInput(nameEl.value.trim()) : '';
                const phone = phoneEl.value ? sanitizeInput(phoneEl.value.trim()) : '';
                const email = emailEl && emailEl.value ? sanitizeInput(emailEl.value.trim()) : '';
                const situation = situationEl.value ? sanitizeInput(situationEl.value) : '';
                const message = messageEl.value ? sanitizeInput(messageEl.value.trim()) : '';
            
            // 必須項目チェック
            if (!name || !phone || !situation || !message) {
                alert('必須項目をすべて入力してください。');
                return;
            }
            
            // 入力値の検証
            const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
            if (!phoneRegex.test(phone)) {
                alert('電話番号は数字とハイフンのみ入力してください。');
                return;
            }

            if (email) {
                const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(email)) {
                    alert('正しいメールアドレスを入力してください。');
                    return;
                }
            }

            // reCAPTCHA検証
            if (typeof grecaptcha !== 'undefined') {
                const recaptchaResponse = grecaptcha.getResponse();
                if (!recaptchaResponse) {
                    alert('「私はロボットではありません」にチェックを入れてください。');
                    return;
                }
            }

            // 送信ボタンを無効化
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            // Google Apps Script送信処理
            sendToGoogleAppsScript({
                name: name,
                phone: phone,
                email: email,
                situation: situation,
                message: message,
                recaptchaToken: typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : ''
                }, submitBtn, this);
            });
        }

        // Google Apps Script送信処理
        async function sendToGoogleAppsScript(formData, submitBtn, formElement) {
            // =========================================
            // 重要: GASのデプロイURLをここに設定してください
            // =========================================
            const GAS_URL = 'https://script.google.com/macros/s/AKfycbzAvQ7izs1wAAlBMGMJkvbBhwuW7trkHHxH9hV8FZEoOAkv6nVoqXWyOfbDhPqQCkmm/exec'; // ← ここを変更

            try {
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    mode: 'no-cors', // CORSエラーを回避
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // no-corsモードでは実際のレスポンスは取得できないため、
                // 送信成功と仮定して処理を続行
                alert('お問い合わせありがとうございます。\n内容を確認の上、2営業日以内にご連絡いたします。');

                // フォームリセット
                formElement.reset();

                // reCAPTCHAリセット
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }

                // 新しいCSRFトークンを生成
                const newToken = generateCSRFToken();
                document.getElementById('csrfToken').value = newToken;
                sessionStorage.setItem('csrfToken', newToken);

            } catch (error) {
                console.error('送信エラー:', error);
                alert('送信に失敗しました。\nお手数ですが、お電話（099-298-9689）でお問い合わせください。');
            } finally {
                // 送信ボタンを再度有効化
                submitBtn.disabled = false;
                submitBtn.textContent = '無料相談を申し込む';
            }
        }

        // レスポンシブ動画対応
        function updateVideoSource() {
            const video = document.querySelector('.hero-video');
            const source = video.querySelector('source');
            const heroSection = document.querySelector('.hero');
            const isTabletOrMobile = window.innerWidth <= 1024;
            
            if (isTabletOrMobile) {
                source.src = 'images/hero_mobile.mp4';
                video.load(); // 動画を再読み込み
                
                // モバイル動画読み込み後にセクション高さを調整
                video.addEventListener('loadedmetadata', function() {
                    const videoHeight = video.videoHeight;
                    const videoWidth = video.videoWidth;
                    const screenWidth = window.innerWidth;
                    
                    // 画面幅に合わせた動画の高さを計算
                    const scaledHeight = (videoHeight * screenWidth) / videoWidth;
                    heroSection.style.height = scaledHeight + 'px';
                }, { once: true });
                
            } else {
                source.src = 'images/hero_desktop.mp4';
                video.load(); // 動画を再読み込み
                
                // デスクトップ動画読み込み後にセクション高さを調整
                video.addEventListener('loadedmetadata', function() {
                    const videoHeight = video.videoHeight;
                    const videoWidth = video.videoWidth;
                    const screenWidth = window.innerWidth;
                    
                    // 画面幅に合わせた動画の高さを計算
                    const scaledHeight = (videoHeight * screenWidth) / videoWidth;
                    heroSection.style.height = scaledHeight + 'px';
                }, { once: true });
            }
        }

        // ページ読み込み時とリサイズ時に動画ソースを更新
        window.addEventListener('load', updateVideoSource);
        window.addEventListener('resize', updateVideoSource);

        // ハンバーガーメニューの制御
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navMenu = document.getElementById('navMenu');
        const navOverlay = document.getElementById('navOverlay');
        const navCloseBtn = document.getElementById('navCloseBtn');
        const navLinks = document.querySelectorAll('.nav-link');

        // メニューを開く
        hamburgerMenu.addEventListener('click', function() {
            hamburgerMenu.classList.add('active');
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // メニューを閉じる関数
        function closeMenu() {
            hamburgerMenu.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }


        // 閉じるボタンクリック
        navCloseBtn.addEventListener('click', closeMenu);
        
        // オーバーレイクリック
        navOverlay.addEventListener('click', closeMenu);

        // ナビリンククリック時にメニューを閉じる
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // ページトップへ戻るボタンの制御
        const backToTopButton = document.getElementById('backToTop');

        // スクロール時の表示制御
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // ページトップへスクロール
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }); // DOMContentLoaded end
