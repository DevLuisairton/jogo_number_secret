class JogoNumeroSecreto {
    constructor() {
        this.config = {
            facil: { max: 50, tentativas: 15 },
            medio: { max: 200, tentativas: 10 },
            dificil: { max: 1000, tentativas: 7 }
        };
        
        this.dificuldade = 'medio';
        this.listaDeNumerosSorteados = [];
        this.numeroSecreto = this.gerarNumeroAleatorio();
        this.tentativasRestantes = this.config[this.dificuldade].tentativas;
        this.historico = [];
        
        this.iniciarElementos();
        this.novoJogo();
        this.registrarEventos();
    }

    iniciarElementos() {
        this.elementos = {
            input: document.querySelector('.container__input'),
            botaoChutar: document.querySelector('.container__botao'),
            botaoReiniciar: document.getElementById('reiniciar'),
            titulo: document.querySelector('h1'),
            paragrafo: document.querySelector('.texto__paragrafo'),
            historico: document.querySelector('.historico__lista'),
            botoesDificuldade: document.querySelectorAll('.dificuldade__botao'),
            loading: this.criarLoading()
        };
    }

    criarLoading() {
        const div = document.createElement('div');
        div.className = 'loading';
        div.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(div);
        return div;
    }

    registrarEventos() {
        this.elementos.botaoChutar.addEventListener('click', () => this.verificarChute());
        this.elementos.botaoReiniciar.addEventListener('click', () => this.novoJogo());
        this.elementos.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verificarChute();
        });

        this.elementos.botoesDificuldade.forEach(botao => {
            botao.addEventListener('click', () => this.alterarDificuldade(botao.dataset.dificuldade));
        });
    }

    alterarDificuldade(novaDificuldade) {
        this.dificuldade = novaDificuldade;
        this.elementos.botoesDificuldade.forEach(botao => {
            botao.classList.toggle('active', botao.dataset.dificuldade === novaDificuldade);
        });
        this.novoJogo();
    }

    novoJogo() {
        this.mostrarLoading(true);
        this.numeroSecreto = this.gerarNumeroAleatorio();
        this.tentativasRestantes = this.config[this.dificuldade].tentativas;
        this.historico = [];
        this.limparCampo();
        this.atualizarInterfaceInicial();
        setTimeout(() => this.mostrarLoading(false), 800);
    }

    gerarNumeroAleatorio() {
        let numero;
        const max = this.config[this.dificuldade].max;
        do {
            numero = Math.floor(Math.random() * max) + 1;
        } while (this.listaDeNumerosSorteados.includes(numero));
        
        this.listaDeNumerosSorteados.push(numero);
        return numero;
    }

    verificarChute() {
        const valor = parseInt(this.elementos.input.value);
        if (!this.validarEntrada(valor)) return;

        this.adicionarAoHistorico(valor);
        this.tentativasRestantes--;

        if (valor === this.numeroSecreto) {
            this.ganharJogo();
        } else if (this.tentativasRestantes === 0) {
            this.perderJogo();
        } else {
            this.darDica(valor);
        }
    }

    validarEntrada(valor) {
        const max = this.config[this.dificuldade].max;
        if (isNaN(valor) || valor < 1 || valor > max) {
            this.elementos.input.classList.add('erro');
            setTimeout(() => this.elementos.input.classList.remove('erro'), 1000);
            return false;
        }
        return true;
    }

    darDica(valor) {
        const diferenca = Math.abs(valor - this.numeroSecreto);
        let mensagem = '';
        
        // Determina a mensagem com base na diferença
        if (diferenca > (this.config[this.dificuldade].max * 0.2)) {
            mensagem = valor > this.numeroSecreto ? 'Muito menor' : 'Muito maior';
        } else {
            mensagem = valor > this.numeroSecreto ? 'Um pouco menor' : 'Um pouco maior';
        }
    
        // Adiciona a dica de par ou ímpar a cada 3 tentativas
        if (this.tentativasRestantes % 3 === 0) {
            mensagem += `. Dica: O número é ${this.numeroSecreto % 2 === 0 ? 'par' : 'ímpar'}`;
        }
    
        this.exibirMensagem(mensagem);
        this.limparCampo();
    }

    adicionarAoHistorico(valor) {
        const li = document.createElement('li');
        li.textContent = valor;
        li.className = `historico__item ${valor > this.numeroSecreto ? 'maior' : 'menor'}`;
        li.style.animation = 'entradaHistorico 0.3s ease';
        
        this.elementos.historico.prepend(li);
        setTimeout(() => li.style.animation = '', 300);
    }

    ganharJogo() {
        this.exibirMensagem(`Você acertou em ${this.config[this.dificuldade].tentativas - this.tentativasRestantes} tentativas!`);
        this.elementos.botaoReiniciar.disabled = false;
        this.elementos.input.disabled = true;
        this.animarVitoria();
    }

    perderJogo() {
        this.exibirMensagem(`O número era ${this.numeroSecreto}. Tente novamente!`);
        this.elementos.botaoReiniciar.disabled = false;
        this.elementos.input.disabled = true;
        this.animarDerrota();
    }

    animarVitoria() {
        this.elementos.titulo.style.animation = 'pulse 1s infinite';
        document.body.classList.add('vitoria');
    }

    animarDerrota() {
        this.elementos.titulo.style.animation = 'shake 0.5s';
        document.body.classList.add('derrota');
    }

    exibirMensagem(texto) {
        this.elementos.paragrafo.textContent = texto;
        responsiveVoice.speak(texto, 'Brazilian Portuguese Female', { rate: 1.1 });
    }

    limparCampo() {
        this.elementos.input.value = '';
        this.elementos.input.focus();
        this.elementos.input.placeholder = `Tentativa #${this.config[this.dificuldade].tentativas - this.tentativasRestantes + 1}`;
    }

    mostrarLoading(mostrar) {
        this.elementos.loading.style.display = mostrar ? 'flex' : 'none';
    }

    atualizarInterfaceInicial() {
        const max = this.config[this.dificuldade].max;
        this.exibirMensagem(`Escolha um número entre 1 e ${max}`);
        this.elementos.historico.innerHTML = '';
        this.elementos.input.disabled = false;
        document.body.className = '';
        this.elementos.titulo.style.animation = '';
    }
}

// Inicialização do jogo
document.addEventListener('DOMContentLoaded', () => {
    const jogo = new JogoNumeroSecreto();
});