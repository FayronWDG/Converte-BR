
var tipoMoeda = [
  { sigla: 'BRL', nome: 'Real', simbolo: 'R$', taxa: 1 },
  { sigla: 'USD', nome: 'Dólar Americano', simbolo: '$', taxa: 5.10 },
  { sigla: 'EUR', nome: 'Euro', simbolo: '€', taxa: 5.40 },
  { sigla: 'GBP', nome: 'Libra Esterlina', simbolo: '£', taxa: 6.30 },
  { sigla: 'ARS', nome: 'Peso Argentino', simbolo: 'ARS$', taxa: 0.020 }
];

// Elementos do html
var seletorOrigem = document.getElementById('origem');
var seletorDestino = document.getElementById('destino');
var campoValor = document.getElementById('valor');
var campoResultado = document.getElementById('resultado');
var botaoConverter = document.getElementById('converter');

var listaMoedas = [];

// Função que arredonda para cima com duas casas decimais
// Isso evita números com muitas casas decimais no resultado mostrado para o usuário
function arredondarParaCima(valor) {
  return Math.ceil(valor * 100) / 100;
}

// Preenche as listas para o usuário escolher as moedas de origem e destino
// Assim, ao carregar a página, o usuário verá as opções disponíveis para conversão
function preencherSelects() {
  for (var i = 0; i < listaMoedas.length; i++) {
    var moeda = listaMoedas[i];

    var opcaoOrigem = document.createElement('option');
    opcaoOrigem.value = moeda.sigla;
    opcaoOrigem.textContent = moeda.nome + ' (' + moeda.sigla + ')';
    seletorOrigem.appendChild(opcaoOrigem);

    // Repetimos para a lista de destino, para o usuário escolher a moeda para qual quer converter
    var opcaoDestino = opcaoOrigem.cloneNode(true);
    seletorDestino.appendChild(opcaoDestino);
  }
}

// Aqui carregamos as moedas e suas taxas do servidor quando o usuário abre a página
// Depois que carregar, as listas de moedas aparecerão para que o usuário selecione
fetch('http://localhost:3000/')
  .then(function (res) {
    if (!res.ok) throw new Error('Erro ao carregar moedas');
    return res.json();
  })
  .then(function (dados) {
    // Pega as moedas do objeto recebido e prepara para mostrar na tela
    listaMoedas = dados.tipoMoeda;
    preencherSelects();
  })
  .catch(function (erro) {
    // Caso dê algum problema, informa o usuário na tela que não foi possível carregar as moedas
    campoResultado.innerHTML = '<span class="text-danger">Erro ao carregar moedas.</span>';
    console.error(erro);
  });

// Quando o usuário clicar no botão para converter, isso vai acontecer:
botaoConverter.addEventListener('click', function () {
  // Lê o valor que o usuário digitou, ajusta vírgula para ponto para funcionar no cálculo
  var valor = parseFloat(campoValor.value.replace(',', '.'));
  // Lê as moedas que o usuário escolheu para origem e destino
  var siglaOrigem = seletorOrigem.value;
  var siglaDestino = seletorDestino.value;

  // Caso as moedas ainda não tenham carregado, mostra mensagem para aguardar
  if (listaMoedas.length === 0) {
    campoResultado.innerHTML = '<span class="text-danger">Aguarde o carregamento das moedas.</span>';
    return;
  }
  // Se o valor não for válido ou não foi preenchido, avisa para o usuário corrigir
  if (isNaN(valor) || valor <= 0) {
    campoResultado.innerHTML = '<span class="text-danger">Insira um valor válido.</span>';
    return;
  }
  // Se o usuário não escolher as duas moedas, avisa para selecionar
  if (!siglaOrigem || !siglaDestino) {
    campoResultado.innerHTML = '<span class="text-danger">Selecione ambas as moedas.</span>';
    return;
  }
  // Não faz sentido converter para a mesma moeda, então avisa para escolher moedas diferentes
  if (siglaOrigem === siglaDestino) {
    campoResultado.innerHTML = '<span class="text-danger">Escolha moedas diferentes.</span>';
    return;
  }

  // Procura os dados das moedas escolhidas para fazer o cálculo da conversão
  var moedaOrigem = listaMoedas.find(function (m) { return m.sigla === siglaOrigem; });
  var moedaDestino = listaMoedas.find(function (m) { return m.sigla === siglaDestino; });

  // Se alguma moeda não for encontrada (algo errado na seleção), avisa o usuário
  if (!moedaOrigem || !moedaDestino) {
    campoResultado.innerHTML = '<span class="text-danger">Moeda inválida selecionada.</span>';
    return;
  }

  // Calcula o valor convertido e a taxa de câmbio arredondando para duas casas decimais
  var valorConvertido = arredondarParaCima((valor * moedaOrigem.taxa) / moedaDestino.taxa);
  var taxaCambio = arredondarParaCima(moedaOrigem.taxa / moedaDestino.taxa);

  // Mostra na tela o resultado da conversão e a taxa usada, formatado de forma clara
  campoResultado.innerHTML = `
    <div class="alert alert-success" role="alert">
      ${moedaDestino.simbolo} ${valorConvertido.toFixed(2)}<br>
      <small>1 ${siglaOrigem} = ${taxaCambio.toFixed(2)} ${siglaDestino}</small>
    </div>
  `;
});
