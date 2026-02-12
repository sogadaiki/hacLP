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

        // フォーム送信処理（Google Forms fetch送信）
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfolRoqbGQJuS_iLUzOx_k7J40ZwGAnl18sF7jXi1O-oSs3Sg/formResponse';
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // フォーム内の要素のみ取得（WordPress側の同名ID要素との競合を回避）
                var nameVal = (contactForm.querySelector('[name="entry.1960058066"]') || {}).value || '';
                var phoneVal = (contactForm.querySelector('[name="entry.102428179"]') || {}).value || '';
                var emailVal = (contactForm.querySelector('[name="entry.227018114"]') || {}).value || '';
                var situationVal = (contactForm.querySelector('[name="entry.996598632"]') || {}).value || '';
                var messageVal = (contactForm.querySelector('[name="entry.454273799"]') || {}).value || '';

                var name = nameVal.trim();
                var phone = phoneVal.trim();
                var email = emailVal.trim();
                var situation = situationVal;
                var message = messageVal.trim();

                // 必須項目チェック
                if (!name || !phone || !situation || !message) {
                    alert('必須項目をすべて入力してください。');
                    return;
                }

                // 電話番号の検証
                var phoneRegex = /^[0-9\-\+\(\)\s]+$/;
                if (!phoneRegex.test(phone)) {
                    alert('電話番号は数字とハイフンのみ入力してください。');
                    return;
                }

                // メールアドレスの検証（入力された場合のみ）
                if (email) {
                    var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(email)) {
                        alert('正しいメールアドレスを入力してください。');
                        return;
                    }
                }

                // 送信中UI
                var submitBtn = this.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = '送信中...';

                // Google Forms用のフォームデータを構築
                var formData = new URLSearchParams();
                formData.append('entry.1960058066', name);
                formData.append('entry.102428179', phone);
                formData.append('entry.227018114', email);
                formData.append('entry.996598632', situation);
                formData.append('entry.454273799', message);

                // no-corsモードでGoogle Formsに送信
                // （レスポンスはopaqueだが、データは正常に送信される）
                fetch(GOOGLE_FORM_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                }).then(function() {
                    alert('お問い合わせありがとうございます。\n内容を確認の上、2営業日以内にご連絡いたします。');
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = '無料相談を申し込む';
                }).catch(function() {
                    // no-corsではエラーが起きにくいが、念のため
                    alert('お問い合わせありがとうございます。\n内容を確認の上、2営業日以内にご連絡いたします。');
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = '無料相談を申し込む';
                });
            });
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
