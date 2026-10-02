// =====================================================
// CONFIGURAÇÕES
// =====================================================
// Teste de regressão: altere para 8 e verifique se o cadastro ainda funciona
const MIN_SENHA = 6;

// Chave do localStorage (os testes de integração trocam essa chave
// temporariamente para não apagar os dados reais)
let CHAVE_STORAGE = "usuarios";

// =====================================================
// FUNÇÕES DE VALIDAÇÃO (testadas na Parte 2)
// =====================================================
function validarNome(nome) {
  return nome.trim().length >= 3;
}

function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validarSenha(senha) {
  return senha.length >= MIN_SENHA && /\d/.test(senha);
}

function validarConfirmacao(senha, confirmar) {
  return senha === confirmar;
}

// =====================================================
// PERSISTÊNCIA (localStorage)
// =====================================================
function obterUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
}

function salvarUsuario(usuario) {
  const usuarios = obterUsuarios();

  const existe = usuarios.some(u => u.email === usuario.email);
  if (existe) {
    return { ok: false, erro: "Este email já está cadastrado!" };
  }

  usuarios.push(usuario);
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarios));
  return { ok: true };
}

function autenticar(email, senha) {
  const usuarios = obterUsuarios();
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return { ok: false, erro: "Usuário não encontrado!" };
  }
  if (usuario.senha !== senha) {
    return { ok: false, erro: "Senha incorreta!" };
  }
  return { ok: true, usuario: usuario };
}

// =====================================================
// FUNÇÕES DE INTERFACE
// =====================================================
function mostrarMensagem(idElemento, texto, cor) {
  const el = document.getElementById(idElemento);
  el.textContent = texto;
  el.style.color = cor;
}

function marcarCampo(campo, valido) {
  campo.classList.remove("erro", "sucesso");
  campo.classList.add(valido ? "sucesso" : "erro");
}

function limparCampos(idForm) {
  document.querySelectorAll("#" + idForm + " input").forEach(i => {
    i.classList.remove("erro", "sucesso");
  });
}

function mostrarForm(tipo) {
  const formCadastro = document.getElementById("formCadastro");
  const formLogin = document.getElementById("formLogin");
  const tabCadastro = document.getElementById("tabCadastro");
  const tabLogin = document.getElementById("tabLogin");

  if (tipo === "cadastro") {
    formCadastro.classList.remove("oculto");
    formLogin.classList.add("oculto");
    tabCadastro.classList.add("ativa");
    tabLogin.classList.remove("ativa");
  } else {
    formLogin.classList.remove("oculto");
    formCadastro.classList.add("oculto");
    tabLogin.classList.add("ativa");
    tabCadastro.classList.remove("ativa");
  }
}

// =====================================================
// CADASTRO
// =====================================================
function cadastrar() {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");

  limparCampos("formCadastro");

  const nomeOk = validarNome(nome.value);
  const emailOk = validarEmail(email.value);
  const senhaOk = validarSenha(senha.value);
  const confirmarOk = validarConfirmacao(senha.value, confirmar.value) && confirmar.value !== "";

  marcarCampo(nome, nomeOk);
  marcarCampo(email, emailOk);
  marcarCampo(senha, senhaOk);
  marcarCampo(confirmar, confirmarOk);

  // Mensagens de erro específicas (na ordem dos campos)
  if (nome.value.trim() === "") {
    return mostrarMensagem("mensagemCadastro", "❌ Erro: o nome é obrigatório!", "red");
  }
  if (!nomeOk) {
    return mostrarMensagem("mensagemCadastro", "❌ Erro: o nome deve ter no mínimo 3 caracteres!", "red");
  }
  if (!emailOk) {
    return mostrarMensagem("mensagemCadastro", "❌ Erro de formato: digite um email válido (ex: nome@email.com)!", "red");
  }
  if (!senhaOk) {
    return mostrarMensagem(
      "mensagemCadastro",
      "❌ Senha fraca: use no mínimo " + MIN_SENHA + " caracteres e pelo menos 1 número!",
      "red"
    );
  }
  if (!confirmarOk) {
    return mostrarMensagem("mensagemCadastro", "❌ Erro de confirmação: as senhas não são iguais!", "red");
  }

  const resultado = salvarUsuario({
    nome: nome.value.trim(),
    email: email.value.trim(),
    senha: senha.value
  });

  if (!resultado.ok) {
    marcarCampo(email, false);
    return mostrarMensagem("mensagemCadastro", "❌ " + resultado.erro, "red");
  }

  mostrarMensagem("mensagemCadastro", "✅ Cadastro realizado com sucesso!", "green");
}

// =====================================================
// LOGIN
// =====================================================
function login() {
  const email = document.getElementById("loginEmail");
  const senha = document.getElementById("loginSenha");

  limparCampos("formLogin");

  if (email.value.trim() === "" || senha.value === "") {
    marcarCampo(email, email.value.trim() !== "");
    marcarCampo(senha, senha.value !== "");
    return mostrarMensagem("mensagemLogin", "❌ Preencha email e senha!", "red");
  }

  const resultado = autenticar(email.value.trim(), senha.value);

  if (!resultado.ok) {
    marcarCampo(email, false);
    marcarCampo(senha, false);
    return mostrarMensagem("mensagemLogin", "❌ " + resultado.erro, "red");
  }

  marcarCampo(email, true);
  marcarCampo(senha, true);
  mostrarMensagem("mensagemLogin", "✅ Login realizado! Bem-vindo(a), " + resultado.usuario.nome + "!", "green");
}

// =====================================================
// TESTES AUTOMATIZADOS
// =====================================================
let falhas = 0;

function testar(condicao, mensagem) {
  if (!condicao) {
    console.assert(false, mensagem);
    falhas++;
  }
}

// ---- Parte 2: Testes de unidade ----
function testesUnitarios() {
  // Email
  testar(validarEmail("teste@gmail.com") === true, "Email válido falhou");
  testar(validarEmail("teste@") === false, "Email inválido passou");
  testar(validarEmail("") === false, "Email vazio passou");

  // Nome
  testar(validarNome("Maria") === true, "Nome válido falhou");
  testar(validarNome("Jo") === false, "Nome curto passou");
  testar(validarNome("") === false, "Nome vazio passou");

  // Senha (usa MIN_SENHA para continuar válido no teste de regressão)
  testar(validarSenha("1234567890") === true, "Senha válida falhou");
  testar(validarSenha("abc") === false, "Senha inválida passou");
  testar(validarSenha("123") === false, "Senha fraca passou");
  testar(validarSenha("abcdefghij") === false, "Senha sem número passou");

  // Confirmação
  testar(validarConfirmacao("abc123", "abc123") === true, "Senhas iguais falharam");
  testar(validarConfirmacao("123456", "123") === false, "Senhas diferentes passaram");
}

// ---- Parte 3: Teste de integração (cadastro -> localStorage -> login) ----
function testesIntegracao() {
  const chaveOriginal = CHAVE_STORAGE;
  CHAVE_STORAGE = "usuarios_teste"; // não mexe nos dados reais
  localStorage.removeItem(CHAVE_STORAGE);

  const usuario = { nome: "Ana Teste", email: "ana@teste.com", senha: "senha123" };

  // 1. Cadastrar usuário (salva no localStorage)
  const cadastro = salvarUsuario(usuario);
  testar(cadastro.ok === true, "Integração: cadastro falhou");
  testar(obterUsuarios().length === 1, "Integração: usuário não foi salvo no localStorage");

  // 2. Login com os mesmos dados -> sucesso
  const loginOk = autenticar("ana@teste.com", "senha123");
  testar(loginOk.ok === true, "Integração: login válido falhou");
  testar(loginOk.usuario && loginOk.usuario.nome === "Ana Teste", "Integração: dados recuperados incorretamente");

  // 3. Login com senha errada -> erro
  const loginSenhaErrada = autenticar("ana@teste.com", "errada999");
  testar(loginSenhaErrada.ok === false, "Integração: login com senha errada passou");

  // 4. Login com usuário inexistente -> erro
  const loginInexistente = autenticar("naoexiste@teste.com", "senha123");
  testar(loginInexistente.ok === false, "Integração: login com usuário inexistente passou");

  // 5. Email duplicado -> erro
  const duplicado = salvarUsuario(usuario);
  testar(duplicado.ok === false, "Integração: email duplicado foi aceito");

  // Limpa e restaura a chave original
  localStorage.removeItem(CHAVE_STORAGE);
  CHAVE_STORAGE = chaveOriginal;
}

// Executa tudo
testesUnitarios();
testesIntegracao();

if (falhas === 0) {
  console.log("✅ Testes OK! Todos os testes de unidade e integração passaram.");
} else {
  console.log("❌ " + falhas + " teste(s) falharam. Veja os erros acima.");
}