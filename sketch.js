function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
// Variáveis do Jogo
let telaAtual = 0; // 0: Tela Inicial, 1: Coleta, 2: Exportação, 3: Loja de Skins
let carroX, carroY;
let velocidadeCarro = 4;
let moedas = 0;
let frutasColetadas = 0;
let capacidadeCarro = 10; // Quantidade máxima de frutas que o carro pode levar

let frutasNoMapa = []; // Array para armazenar as frutas no chão
const MAX_FRUTAS_NO_MAPA = 8; // Limite de frutas visíveis de uma vez
const TAMANHO_FRUTA = 20;

// Variáveis de Cores
let corGrama;
let corEstrada;
let corMercado;

// Variáveis para as Skins do Carro
let skinsCarro = [
  { nome: "Clássico", cor: [255, 60, 0], preco: 0, comprada: true, selecionada: true }, // Skin inicial
  { nome: "Azul Fazenda", cor: [0, 100, 200], preco: 50, comprada: false, selecionada: false },
  { nome: "Verde Militar", cor: [70, 130, 70], preco: 100, comprada: false, selecionada: false },
  { nome: "Dourado Luxo", cor: [255, 215, 0], preco: 250, comprada: false, selecionada: false }
];
let skinAtual; // Armazena a skin selecionada para desenhar o carro

// Variáveis de Som
let somFundo; // Som de fundo
let somCarro; // Som do motor do carro
let somColeta; // Som de coleta de fruta

function preload() {
  // Carrega os arquivos de som
  // Certifique-se de que esses arquivos estejam na mesma pasta do seu sketch ou forneça o caminho correto.
  // Você pode encontrar sons gratuitos em sites como Freesound.org ou Pixabay.com
  somFundo = loadSound('opa.mp3'); // Substitua pelo seu arquivo de música de fundo
  somCarro = loadSound('beta.mp3');     // Substitua pelo seu arquivo de som do carro
  somColeta = loadSound('box.mp3');   // Substitua pelo seu arquivo de som de coleta
}

function setup() {
  createCanvas(800, 600); // Cria a tela do jogo

  // Posição inicial do carro
  carroX = width / 2;
  carroY = height - 80;

  // Definição das cores base
  corGrama = color(100, 200, 100); // Verde vibrante
  corEstrada = color(80, 80, 80); // Cinza escuro
  corMercado = color(150, 100, 50); // Marrom madeira

  // Define a skin inicial como a skin atual do carro
  skinAtual = skinsCarro[0];

  // Gera algumas frutas iniciais
  gerarFrutasNoMapa(MAX_FRUTAS_NO_MAPA);

  // Configura o som de fundo para loop e baixo volume
  somFundo.setVolume(0.3); // Ajuste o volume conforme necessário (0.0 a 1.0)
  somFundo.loop(); // Faz o som de fundo tocar em loop

  // Configura o som do carro para loop (mas só tocará quando o carro se mover)
  somCarro.setVolume(0.5); // Ajuste o volume conforme necessário
}

function draw() {
  // Lógica principal do jogo baseada na tela atual
  switch (telaAtual) {
    case 0:
      desenharTelaInicial();
      break;
    case 1:
      faseColeta();
      break;
    case 2:
      faseExportacao();
      break;
    case 3:
      desenharLojaSkins();
      break;
  }

  // Desenha a interface de moedas e frutas em todas as telas de jogo (exceto a inicial)
  if (telaAtual > 0 && telaAtual !== 3) {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Moedas: $${moedas}`, 20, 20);
    text(`Frutas no Carro: ${frutasColetadas}/${capacidadeCarro}`, 20, 50);
  }
}

// --- Funções das Telas do Jogo ---

function desenharTelaInicial() {
  background(corGrama); // Fundo verde da fazenda

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("Fazenda Exportadora", width / 2, height / 2 - 80);

  textSize(25);
  text("Projeto Agrinho", width / 2, height / 2 - 20);

  // Botão "Começar"
  fill(50, 180, 50); // Verde mais escuro
  rect(width / 2 - 100, height / 2 + 50, 200, 60, 15); // Botão arredondado

  fill(255);
  textSize(30);
  text("COMEÇAR", width / 2, height / 2 + 80);
}

function faseColeta() {
  background(corGrama); // Campo verde
  desenharEstrada(false); // Desenha a estrada sem o mercado

  // Variável para verificar se o carro está se movendo
  let carroMovendo = false;

  // Movimento do carro com as setas
  if (keyIsDown(LEFT_ARROW)) {
    carroX -= velocidadeCarro;
    carroMovendo = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    carroX += velocidadeCarro;
    carroMovendo = true;
  }
  if (keyIsDown(UP_ARROW)) {
    carroY -= velocidadeCarro;
    carroMovendo = true;
  }
  if (keyIsDown(DOWN_ARROW)) {
    carroY += velocidadeCarro;
    carroMovendo = true;
  }

  // Toca o som do carro se ele estiver se movendo, pausa se não
  if (carroMovendo) {
    if (!somCarro.isPlaying()) {
      somCarro.loop(); // Toca o som em loop enquanto o carro se move
    }
  } else {
    if (somCarro.isPlaying()) {
      somCarro.pause(); // Pausa o som quando o carro para
    }
  }

  // Limitar o carro dentro da tela
  carroX = constrain(carroX, 30, width - 30);
  carroY = constrain(carroY, 30, height - 30);

  desenharCarro();

  // Desenhar e coletar frutas
  for (let i = frutasNoMapa.length - 1; i >= 0; i--) {
    let fruta = frutasNoMapa[i];
    desenharFruta(fruta.x, fruta.y);

    // Colisão do carro com a fruta
    let distancia = dist(carroX, carroY, fruta.x, fruta.y);
    if (distancia < (TAMANHO_FRUTA / 2 + 20) && frutasColetadas < capacidadeCarro) {
      frutasNoMapa.splice(i, 1); // Remove a fruta do mapa
      frutasColetadas++; // Adiciona ao carro
      somColeta.play(); // Toca o som de coleta
      // Se tiver menos frutas que o máximo permitido, gera mais
      if (frutasNoMapa.length < MAX_FRUTAS_NO_MAPA) {
        gerarFrutasNoMapa(1); // Gera apenas uma nova fruta
      }
    }
  }

  // Mensagem para ir para exportação
  if (frutasColetadas === capacidadeCarro) {
    fill(255, 200, 0); // Amarelo vibrante
    textSize(28);
    textAlign(CENTER, TOP);
    text("Carro Cheio! Vá para o Mercado!", width / 2, height - 110);

    // Botão "Ir para Mercado"
    fill(0, 120, 0); // Verde escuro
    rect(width / 2 - 120, height - 40, 240, 40, 10);
    fill(255);
    textSize(20);
    text("Clique para Exportar!", width / 2, height - 30);
  }

  // Botão para ir para a Loja de Skins (visível na tela de coleta)
  fill(100, 50, 150); // Roxo
  rect(width - 150, 20, 130, 40, 10);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Loja de Skins", width - 85, 40);
}

function faseExportacao() {
  background(corGrama); // Campo verde
  desenharEstrada(true); // Desenha a estrada com o mercado

  // Pausa o som do carro ao entrar na fase de exportação
  if (somCarro.isPlaying()) {
    somCarro.pause();
  }

  // Posiciona o carro perto do mercado para exportação
  carroX = width / 2;
  carroY = height / 2 + 100;

  desenharCarro();

  fill(0);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("Exportando suas Frutas!", width / 2, 200);

  if (frutasColetadas > 0) {
    fill(255, 200, 0);
    textSize(25);
    text(`Vendendo ${frutasColetadas} frutas...`, width / 2, height / 2);

    // Simula a venda (poderia ser um delay)
    moedas += frutasColetadas * 5; // Ganha 5 moedas por fruta
    frutasColetadas = 0; // Zera as frutas no carro

    // Botão para voltar à coleta
    fill(0, 120, 0);
    rect(width / 2 - 100, height - 80, 200, 50, 10);
    fill(255);
    textSize(25);
    text("Voltar para Coleta", width / 2, height - 55);
  } else {
    fill(0);
    textSize(25);
    text("Nenhuma fruta para vender!", width / 2, height / 2);
    // Botão para voltar à coleta (mesmo sem frutas)
    fill(0, 120, 0);
    rect(width / 2 - 100, height - 80, 200, 50, 10);
    fill(255);
    textSize(25);
    text("Voltar para Coleta", width / 2, height - 55);
  }
}

function desenharLojaSkins() {
  background(150, 200, 250); // Fundo azul claro para a loja

  // Pausa o som do carro ao entrar na loja de skins
  if (somCarro.isPlaying()) {
    somCarro.pause();
  }

  fill(0);
  textSize(40);
  textAlign(CENTER, TOP);
  text("Loja de Skins de Carro", width / 2, 50);

  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Suas Moedas: $${moedas}`, 20, 20);

  // Desenhar as opções de skins
  let startX = 50;
  let startY = 120;
  let skinLargura = 150;
  let skinAltura = 100;
  let espacamento = 30;

  for (let i = 0; i < skinsCarro.length; i++) {
    let skin = skinsCarro[i];
    let x = startX + i * (skinLargura + espacamento);
    let y = startY;

    // Desenhar a "caixa" da skin
    fill(200); // Fundo cinza claro para cada skin
    rect(x, y, skinLargura, skinAltura, 10);

    // Desenhar a cor da skin no preview
    fill(skin.cor[0], skin.cor[1], skin.cor[2]);
    rect(x + 10, y + 10, skinLargura - 20, skinAltura / 2 - 10, 5); // Preview da cor

    // Nome da skin
    fill(0);
    textSize(18);
    textAlign(CENTER, TOP);
    text(skin.nome, x + skinLargura / 2, y + skinAltura / 2 + 10);

    // Preço ou status (Comprada/Selecionada)
    textSize(16);
    if (skin.comprada) {
      fill(0, 150, 0); // Verde para "Comprada"
      text("COMPRADA", x + skinLargura / 2, y + skinAltura - 25);
      if (skin.selecionada) {
        fill(0, 0, 200); // Azul para "Selecionada"
        text("SELECIONADA", x + skinLargura / 2, y + skinAltura - 10);
      } else {
        // Botão Selecionar
        fill(50, 50, 180); // Azul mais escuro
        rect(x + skinLargura / 2 - 40, y + skinAltura - 25, 80, 20, 5);
        fill(255);
        text("Selecionar", x + skinLargura / 2, y + skinAltura - 15);
        skin.botaoX = x + skinLargura / 2 - 40;
        skin.botaoY = y + skinAltura - 25;
        skin.botaoLargura = 80;
        skin.botaoAltura = 20;
      }
    } else {
      fill(180, 0, 0); // Vermelho para o preço
      text(`$${skin.preco}`, x + skinLargura / 2, y + skinAltura - 30);
      // Botão Comprar
      fill(0, 150, 0); // Verde para "Comprar"
      rect(x + skinLargura / 2 - 40, y + skinAltura - 25, 80, 20, 5);
      fill(255);
      text("Comprar", x + skinLargura / 2, y + skinAltura - 23);
      skin.botaoX = x + skinLargura / 2 - 40;
      skin.botaoY = y + skinAltura - 25;
      skin.botaoLargura = 80;
      skin.botaoAltura = 20;
    }
  }

  // Botão "Voltar ao Jogo"
  fill(180, 50, 0); // Laranja avermelhado
  rect(width / 2 - 100, height - 80, 200, 50, 15);
  fill(255);
  textSize(25);
  text("Voltar ao Jogo", width / 2, height - 55);
}


// --- Funções de Desenho ---

function desenharEstrada(comMercado) {
  fill(corEstrada);
  rect(width / 2 - 100, 0, 200, height); // Estrada principal

  // Linhas da estrada
  stroke(255, 255, 0); // Amarelo
  strokeWeight(4);
  for (let i = 0; i < height; i += 60) {
    line(width / 2, i, width / 2, i + 30);
  }
  noStroke();

  if (comMercado) {
    // Desenha o mercado no topo da estrada
    fill(corMercado);
    rect(width / 2 - 120, 50, 240, 100, 15); // Prédio do mercado
    fill(200, 200, 0); // Telhado amarelo
    triangle(width / 2 - 120, 50, width / 2 + 120, 50, width / 2, 20);

    fill(255);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("MERCADO DA FAZENDA", width / 2, 100);
  }
}

function desenharCarro() {
  // Corpo do carro (usa a cor da skin atual)
  fill(skinAtual.cor[0], skinAtual.cor[1], skinAtual.cor[2]);
  rect(carroX - 30, carroY - 40, 60, 80, 10); // Carro arredondado

  // Rodas
  fill(50); // Cinza escuro para as rodas
  ellipse(carroX - 25, carroY - 20, 15, 15);
  ellipse(carroX + 25, carroY - 20, 15, 15);
  ellipse(carroX - 25, carroY + 20, 15, 15);
  ellipse(carroX + 25, carroY + 20, 15, 15);

  // Parte de cima (cabine)
  fill(180, 200, 255); // Azul claro para o vidro
  rect(carroX - 25, carroY - 30, 50, 30, 5);
}

function desenharFruta(x, y) {
  fill(255, 0, 0); // Cor vermelha para a fruta (pode mudar para maçã, laranja etc.)
  ellipse(x, y, TAMANHO_FRUTA, TAMANHO_FRUTA);
  fill(0, 100, 0); // Pequeno cabinho verde
  rect(x - 2, y - TAMANHO_FRUTA / 2 - 5, 4, 5);
}

// --- Funções de Lógica do Jogo ---

function gerarFrutasNoMapa(quantidade) {
  for (let i = 0; i < quantidade; i++) {
    let x = random(50, width - 50);
    let y = random(50, height - 50);
    // Garante que a fruta não nasce na estrada ou muito perto do mercado
    if (x > width / 2 - 120 && x < width / 2 + 120) {
      x = random(50, width / 2 - 150); // Força a fruta para fora da estrada
      if (random() > 0.5) x = random(width / 2 + 150, width - 50);
    }
    if (y < 200 && telaAtual === 2) { // Evita frutas no mercado na fase de exportação
      y = random(250, height - 50);
    }

    frutasNoMapa.push({
      x: x,
      y: y
    });
  }
}

// --- Gerenciamento de Cliques do Mouse ---

function mousePressed() {
  if (telaAtual === 0) {
    // Verifica clique no botão "Começar"
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > height / 2 + 50 && mouseY < height / 2 + 110) {
      telaAtual = 1; // Muda para a fase de coleta
      // Reseta frutas no mapa para o início da fase de coleta
      frutasNoMapa = [];
      gerarFrutasNoMapa(MAX_FRUTAS_NO_MAPA);
    }
  } else if (telaAtual === 1) {
    // Se o carro estiver cheio, permite ir para a exportação
    if (frutasColetadas === capacidadeCarro) {
      if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
        mouseY > height - 40 && mouseY < height) {
        telaAtual = 2; // Muda para a fase de exportação
      }
    }
    // Clique no botão Loja de Skins
    if (mouseX > width - 150 && mouseX < width - 20 &&
      mouseY > 20 && mouseY < 60) {
      telaAtual = 3; // Vai para a tela da Loja
    }

  } else if (telaAtual === 2) {
    // Permite voltar para a coleta após exportar
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > height - 80 && mouseY < height - 30) {
      telaAtual = 1; // Volta para a fase de coleta
      // Gera novas frutas para a próxima rodada de coleta
      frutasNoMapa = [];
      gerarFrutasNoMapa(MAX_FRUTAS_NO_MAPA);
    }
  } else if (telaAtual === 3) { // Lógica da Loja de Skins
    // Clique no botão "Voltar ao Jogo"
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
      mouseY > height - 80 && mouseY < height - 30) {
      telaAtual = 1; // Volta para a fase de coleta
    }

    // Lógica de compra/seleção de skins
    let startX = 50;
    let startY = 120;
    let skinLargura = 150;
    let skinAltura = 100;
    let espacamento = 30;

    for (let i = 0; i < skinsCarro.length; i++) {
      let skin = skinsCarro[i];
      // Verifica se clicou em um dos botões da skin
      if (mouseX > skin.botaoX && mouseX < skin.botaoX + skin.botaoLargura &&
        mouseY > skin.botaoY && mouseY < skin.botaoY + skin.botaoAltura) {
        if (skin.comprada) {
          // Se já comprou, apenas seleciona
          for (let s of skinsCarro) { // Desseleciona todas as outras
            s.selecionada = false;
          }
          skin.selecionada = true;
          skinAtual = skin; // Atualiza a skin do carro
          console.log(`Skin ${skin.nome} selecionada!`);
        } else {
          // Tenta comprar
          if (moedas >= skin.preco) {
            moedas -= skin.preco;
            skin.comprada = true;
            for (let s of skinsCarro) { // Desseleciona todas as outras
              s.selecionada = false;
            }
            skin.selecionada = true;
            skinAtual = skin; // Atualiza a skin do carro
            console.log(`Skin ${skin.nome} comprada e selecionada!`);
          } else {
            alert(`Você precisa de $${skin.preco - moedas} moedas para comprar esta skin!`);
          }
        }
        break; // Sai do loop após interagir com uma skin
      }
    }
  }
}