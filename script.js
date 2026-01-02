class QuizApp {
    constructor() {
        this.questions = [];
        this.currentDay = 1;
        this.attemptsLeft = 2;
        this.userAnswers = {};
        this.loadProgress();
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.showQuestionForDay();
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.questions = await response.json();
        } catch (error) {
            console.error('Sorular yüklenemedi:', error);
        }
    }

    loadProgress() {
        const saved = localStorage.getItem('quizProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentDay = progress.currentDay || 1;
            this.userAnswers = progress.userAnswers || {};
        }
        
        // Otomatik gün güncelleme (bugünün tarihine göre)
        const startDate = localStorage.getItem('quizStartDate');
        if (!startDate) {
            localStorage.setItem('quizStartDate', new Date().toISOString());
        } else {
            const start = new Date(startDate);
            const today = new Date();
            const diffTime = Math.abs(today - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            this.currentDay = Math.min(diffDays, this.questions.length);
        }
    }

    saveProgress() {
        const progress = {
            currentDay: this.currentDay,
            userAnswers: this.userAnswers
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    showQuestionForDay() {
        const question = this.questions.find(q => q.day === this.currentDay);
        if (!question) {
            document.getElementById('questionText').textContent = 'Bugün için soru bulunamadı.';
            return;
        }

        document.getElementById('currentDay').textContent = this.currentDay;
        document.getElementById('questionId').textContent = question.id;
        document.getElementById('questionText').textContent = question.question;
        
        this.displayOptions(question);
        this.updateProgress();
        this.resetAttempts();
        
        // Eğer daha önce cevaplandıysa
        if (this.userAnswers[question.id]) {
            this.disableQuiz();
            this.showExplanation(question);
        }
    }

    displayOptions(question) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.className = 'option';
            div.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
            div.dataset.index = index;
            div.onclick = () => this.selectOption(index, question);
            container.appendChild(div);
        });
    }

    selectOption(selectedIndex, question) {
        if (this.attemptsLeft <= 0 || this.userAnswers[question.id]) return;
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        options[selectedIndex].classList.add('selected');
        
        this.checkAnswer(selectedIndex, question);
    }

    checkAnswer(selectedIndex, question) {
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.showCorrectFeedback();
            this.userAnswers[question.id] = { 
                correct: true, 
                answer: selectedIndex 
            };
            this.saveProgress();
            this.showExplanation(question);
            this.disableQuiz();
        } else {
            this.attemptsLeft--;
            document.getElementById('attemptsLeft').textContent = this.attemptsLeft;
            
            if (this.attemptsLeft > 0) {
                this.showWrongFeedback('Bir deneme hakkınız kaldı!');
            } else {
                this.showWrongFeedback('Doğru cevap gösteriliyor...');
                this.revealCorrectAnswer(question);
                this.userAnswers[question.id] = { 
                    correct: false, 
                    answer: selectedIndex 
                };
                this.saveProgress();
                this.showExplanation(question);
                this.disableQuiz();
            }
        }
    }

    showCorrectFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fas fa-check-circle" style="font-size:24px;"></i>
                <span><strong>Doğru!</strong> Tebrikler! 🎉</span>
            </div>
        `;
        feedback.className = 'feedback correct celebrate';
        
        this.createCelebration();
    }

    showWrongFeedback(message) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fas fa-times-circle" style="font-size:24px;"></i>
                <span><strong>Yanlış!</strong> ${message}</span>
            </div>
        `;
        feedback.className = 'feedback wrong';
    }

    revealCorrectAnswer(question) {
        const options = document.querySelectorAll('.option');
        options.forEach((opt, index) => {
            if (index === question.correct) {
                opt.classList.add('correct');
            } else if (opt.classList.contains('selected')) {
                opt.classList.add('wrong');
            }
        });
    }

    showExplanation(question) {
        const explanation = document.getElementById('explanation');
        explanation.innerHTML = `
            <h3><i class="fas fa-lightbulb"></i> Açıklama</h3>
            <p>${question.explanation}</p>
        `;
        explanation.style.display = 'block';
        
        // Sonraki soru butonunu aktif et
        if (this.currentDay < this.questions.length) {
            document.getElementById('nextBtn').disabled = false;
        }
    }

    disableQuiz() {
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
    }

    createCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.style.display = 'block';
        celebration.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            celebration.appendChild(confetti);
        }
        
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 2000);
    }

    getRandomColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
                       '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
                       '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    resetAttempts() {
        this.attemptsLeft = 2;
        document.getElementById('attemptsLeft').textContent = this.attemptsLeft;
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('explanation').style.display = 'none';
        document.getElementById('nextBtn').disabled = true;
    }

    updateProgress() {
        const total = this.questions.length;
        const answered = Object.keys(this.userAnswers).length;
        const percentage = (answered / total) * 100;
        
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${answered}/${total}`;
    }

    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentDay < this.questions.length) {
                this.currentDay++;
                this.saveProgress();
                this.showQuestionForDay();
            }
        });
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});