class QuizApp {
    constructor() {
        this.questions = [];
        this.currentDay = 1;
        this.currentQuestionIndex = 0;
        this.attemptsLeft = 2;
        this.stats = {
            correct: 0,
            wrong: 0
        };
        
        this.loadProgress();
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.showQuestion();
        this.updateStats();
        this.updateProgressDots();
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();
            
            // Bugünün tarihine göre günü belirle
            this.setCurrentDay();
            
            // Bugünün sorularını al
            const todayData = data.days.find(day => day.day === this.currentDay);
            if (todayData) {
                this.questions = todayData.questions;
            }
        } catch (error) {
            console.error('Sorular yüklenemedi:', error);
            document.getElementById('questionText').textContent = 
                'Sorular yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
        }
    }

    setCurrentDay() {
        const savedDay = localStorage.getItem('quizCurrentDay');
        if (savedDay) {
            this.currentDay = parseInt(savedDay);
        } else {
            this.currentDay = 1;
            localStorage.setItem('quizCurrentDay', '1');
        }
    }

    loadProgress() {
        const savedStats = localStorage.getItem('quizStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }

    saveProgress() {
        localStorage.setItem('quizStats', JSON.stringify(this.stats));
        localStorage.setItem('quizCurrentDay', this.currentDay.toString());
        
        // Bugünün sorularının durumunu kaydet
        const todayKey = `day${this.currentDay}_progress`;
        const progress = this.questions.map((q, index) => ({
            answered: this.getUserAnswer(index) !== null,
            correct: this.getUserAnswer(index) === q.correct
        }));
        localStorage.setItem(todayKey, JSON.stringify(progress));
    }

    getUserAnswer(questionIndex) {
        const key = `day${this.currentDay}_q${questionIndex}`;
        return localStorage.getItem(key);
    }

    saveUserAnswer(questionIndex, answer) {
        const key = `day${this.currentDay}_q${questionIndex}`;
        localStorage.setItem(key, answer);
    }

    showQuestion() {
        if (this.questions.length === 0) return;
        
        const question = this.questions[this.currentQuestionIndex];
        
        // UI güncelle
        document.getElementById('currentDay').textContent = this.currentDay;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('questionNumber').textContent = this.currentQuestionIndex + 1;
        document.getElementById('questionText').textContent = question.question;
        
        // Seçenekleri göster
        this.displayOptions(question);
        
        // Deneme hakkını sıfırla
        this.attemptsLeft = 2;
        document.getElementById('attemptsLeft').textContent = this.attemptsLeft;
        
        // Feedback ve açıklamayı temizle
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('explanation').style.display = 'none';
        
        // Buton durumlarını güncelle
        document.getElementById('prevBtn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentQuestionIndex === this.questions.length - 1;
        
        // Eğer daha önce cevaplandıysa
        const userAnswer = this.getUserAnswer(this.currentQuestionIndex);
        if (userAnswer !== null) {
            this.showAnsweredQuestion(question, parseInt(userAnswer));
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

    showAnsweredQuestion(question, userAnswer) {
        this.attemptsLeft = 0;
        document.getElementById('attemptsLeft').textContent = this.attemptsLeft;
        
        const options = document.querySelectorAll('.option');
        options.forEach((opt, index) => {
            opt.style.pointerEvents = 'none';
            
            if (index === question.correct) {
                opt.classList.add('correct');
            } else if (index === userAnswer && index !== question.correct) {
                opt.classList.add('wrong');
            }
        });
        
        // Feedback göster
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) {
            this.showCorrectFeedback();
        } else {
            this.showWrongFeedback('Doğru cevap gösterildi.');
        }
        
        // Açıklamayı göster
        this.showExplanation(question);
    }

    selectOption(selectedIndex, question) {
        if (this.attemptsLeft <= 0) return;
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        options[selectedIndex].classList.add('selected');
        
        this.checkAnswer(selectedIndex, question);
    }

    checkAnswer(selectedIndex, question) {
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.handleCorrectAnswer(question, selectedIndex);
        } else {
            this.handleWrongAnswer(question, selectedIndex);
        }
        
        // Cevabı kaydet
        this.saveUserAnswer(this.currentQuestionIndex, selectedIndex);
        this.saveProgress();
        this.updateStats();
        this.updateProgressDots();
    }

    handleCorrectAnswer(question, selectedIndex) {
        this.showCorrectFeedback();
        this.stats.correct++;
        
        const options = document.querySelectorAll('.option');
        options[selectedIndex].classList.add('correct');
        options.forEach(opt => opt.style.pointerEvents = 'none');
        
        this.showExplanation(question);
        this.attemptsLeft = 0;
    }

    handleWrongAnswer(question, selectedIndex) {
        this.attemptsLeft--;
        document.getElementById('attemptsLeft').textContent = this.attemptsLeft;
        
        const options = document.querySelectorAll('.option');
        options[selectedIndex].classList.add('wrong');
        
        if (this.attemptsLeft === 0) {
            this.stats.wrong++;
            this.showWrongFeedback('Doğru cevap gösteriliyor...');
            this.revealCorrectAnswer(question);
            this.showExplanation(question);
            options.forEach(opt => opt.style.pointerEvents = 'none');
        } else {
            this.showWrongFeedback(`Kalan deneme hakkı: ${this.attemptsLeft}`);
        }
    }

    revealCorrectAnswer(question) {
        const options = document.querySelectorAll('.option');
        options[question.correct].classList.add('correct');
    }

    showCorrectFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 20px;"></i>
                <span><strong>Doğru!</strong> Tebrikler! 🎉</span>
            </div>
        `;
        feedback.className = 'feedback correct celebrate';
    }

    showWrongFeedback(message) {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-times-circle" style="color: #f44336; font-size: 20px;"></i>
                <span><strong>Yanlış!</strong> ${message}</span>
            </div>
        `;
        feedback.className = 'feedback wrong';
    }

    showExplanation(question) {
        const explanation = document.getElementById('explanation');
        explanation.innerHTML = `
            <h3><i class="fas fa-lightbulb"></i> Açıklama</h3>
            <p>${question.explanation}</p>
            <p style="margin-top: 10px; color: #666;">
                <strong>Doğru cevap:</strong> ${String.fromCharCode(65 + question.correct)}) ${question.options[question.correct]}
            </p>
        `;
        explanation.style.display = 'block';
    }

    updateStats() {
        document.getElementById('correctCount').textContent = this.stats.correct;
        document.getElementById('wrongCount').textContent = this.stats.wrong;
        
        const total = this.stats.correct + this.stats.wrong;
        const successRate = total > 0 ? Math.round((this.stats.correct / total) * 100) : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    updateProgressDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed', 'wrong');
            
            if (index === this.currentQuestionIndex) {
                dot.classList.add('active');
            }
            
            const userAnswer = this.getUserAnswer(index);
            if (userAnswer !== null) {
                const question = this.questions[index];
                const isCorrect = parseInt(userAnswer) === question.correct;
                dot.classList.add(isCorrect ? 'completed' : 'wrong');
            }
        });
    }

    setupEventListeners() {
        // Önceki butonu
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.showQuestion();
                this.updateProgressDots();
            }
        });

        // Sonraki butonu
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.showQuestion();
                this.updateProgressDots();
            }
        });

        // Progress noktalarına tıklama
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                if (index >= 0 && index < this.questions.length) {
                    this.currentQuestionIndex = index;
                    this.showQuestion();
                    this.updateProgressDots();
                }
            });
        });
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
