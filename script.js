function mostrarAba(id) {
  const abas = document.querySelectorAll(".aba");
  abas.forEach(aba => {
    aba.style.display = "none";
  });

  const abaAtiva = document.getElementById(id);
  if (abaAtiva) {
    abaAtiva.style.display = "block";
  }
}
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getAuth() {
  return JSON.parse(localStorage.getItem("auth"));
}

function setAuth(user) {
  localStorage.setItem("auth", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("auth");
  window.location.href = "login.html";
}

function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.log("setupLogin: formulário não encontrado");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = form.elements["username"].value.trim();
    const password = form.elements["password"].value;

    console.log("Tentando login com:", { username, password });

    const users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Usuários cadastrados:", users);

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      console.log("Usuário encontrado:", user);
      localStorage.setItem("auth", JSON.stringify(user));
      if (user.role === "admin") {
        console.log("Redirecionando para admin.html");
        window.location.href = "admin.html";
      } else {
        console.log("Redirecionando para index.html");
        window.location.href = "index.html";
      }
    } else {
      console.log("Usuário ou senha inválidos.");
      alert("Usuário ou senha inválidos.");
    }
  });
}


function setupRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value;
    const role = form.role.value;

    if (!username || !password) {
      alert("Preencha usuário e senha.");
      return;
    }

    let users = getUsers();

    if (users.find(u => u.username === username)) {
      alert("Usuário já existe.");
      return;
    }

    users.push({ username, password, role });
    setUsers(users);
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "login.html";
  });
}

function protectPage(roleNeeded) {
  const auth = getAuth();
  if (!auth || auth.role !== roleNeeded) {
    window.location.href = "login.html";
  }
}

function setupAdminPanel() {
  const userTable = document.getElementById("userTable");
  const editForm = document.getElementById("editForm");
  if (!userTable || !editForm) return;

  let users = getUsers();

  function renderUsers() {
    users = getUsers();
    userTable.innerHTML = "";
    users.forEach((user, index) => {
      userTable.innerHTML += `
        <tr>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            <button onclick="editUser(${index})">Editar</button>
            <button onclick="deleteUser(${index})">Excluir</button>
          </td>
        </tr>
      `;
    });
  }

  window.editUser = function(index) {
    const user = users[index];
    document.getElementById("editIndex").value = index;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editPassword").value = user.password;
    document.getElementById("editRole").value = user.role;
    editForm.style.display = "block";
  };

  window.deleteUser = function(index) {
    const auth = getAuth();
    if (users[index].username === auth.username) {
      alert("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      users.splice(index, 1);
      setUsers(users);
      renderUsers();
    }
  };

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById("editIndex").value);
    const username = document.getElementById("editUsername").value.trim();
    const password = document.getElementById("editPassword").value;
    const role = document.getElementById("editRole").value;

    if (!username || !password) {
      alert("Preencha usuário e senha.");
      return;
    }

    if (users.some((u, i) => u.username === username && i !== index)) {
      alert("Já existe um usuário com esse nome.");
      return;
    }

    users[index] = { username, password, role };
    setUsers(users);
    editForm.reset();
    editForm.style.display = "none";
    renderUsers();
  });

  renderUsers();
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  if (document.getElementById("loginForm")) {
    setupLogin();
  }

  if (document.getElementById("registerForm")) {
    setupRegister();
  }

  if (document.body.classList.contains("page-index")) {
    protectPage("user");
  }
  if (document.body.classList.contains("page-admin")) {
    protectPage("admin");
    setupAdminPanel();
  }
});
let requisicaoAtual = null;
let itens = [];

function gerarRequisicao() {
  const obraInput = document.getElementById("obra");
  const obra = obraInput.value.trim();
  if (!obra) {
    alert("Informe o código da obra.");
    return;
  }

  // Inicializa nova requisição
  requisicaoAtual = {
    obra,
    numero: getProximoNumero(obra),
    data: new Date().toLocaleDateString(),
    itens: []
  };

  itens = [];
  atualizarTabela();
  document.getElementById("output").textContent = "";
  alert(`Requisição criada: RM-${obra}-${String(requisicaoAtual.numero).padStart(3, "0")}`);
}

function getProximoNumero(obra) {
  // Pega o maior número salvo para a obra e incrementa
  const chave = `rm-numero-${obra}`;
  let num = parseInt(localStorage.getItem(chave) || "0");
  num++;
  localStorage.setItem(chave, num);
  return num;
}

function adicionarItem() {
  if (!requisicaoAtual) {
    alert("Crie uma nova requisição antes de adicionar itens.");
    return;
  }

  const desc = document.getElementById("descricao").value.trim();
  const qtde = parseFloat(document.getElementById("quantidade").value);
  const unid = document.getElementById("unidade").value.trim();

  if (!desc || !qtde || !unid) {
    alert("Preencha todos os campos (Descrição, Quantidade e Unidade).");
    return;
  }

  itens.push({ descricao: desc, quantidade: qtde, unidade: unid });
  atualizarTabela();

  // Limpar campos
  document.getElementById("descricao").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("unidade").value = "";
}

function atualizarTabela() {
  const tbody = document.querySelector("#tabela tbody");
  tbody.innerHTML = "";

  itens.forEach((item, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.descricao}</td>
      <td>${item.quantidade}</td>
      <td>${item.unidade}</td>
      <td><button onclick="removerItem(${i})">Remover</button></td>
    `;

    tbody.appendChild(tr);
  });
}

function removerItem(index) {
  itens.splice(index, 1);
  atualizarTabela();
}

function exportar() {
  if (!requisicaoAtual) {
    alert("Crie uma requisição antes de exportar.");
    return;
  }
  if (itens.length === 0) {
    alert("Adicione ao menos um item antes de exportar.");
    return;
  }

  let texto = `REQUISIÇÃO DE MATERIAL\n`;
  texto += `Obra: ${requisicaoAtual.obra}\n`;
  texto += `Número: RM-${requisicaoAtual.obra}-${String(requisicaoAtual.numero).padStart(3, "0")}\n`;
  texto += `Data: ${requisicaoAtual.data}\n\n`;
  texto += `Descrição\tQuantidade\tUnidade\n`;

  itens.forEach(item => {
    texto += `${item.descricao}\t${item.quantidade}\t${item.unidade}\n`;
  });

  document.getElementById("output").textContent = texto;
}

function exportarCSV() {
  if (!requisicaoAtual) {
    alert("Crie uma requisição antes de exportar.");
    return;
  }
  if (itens.length === 0) {
    alert("Adicione ao menos um item antes de exportar.");
    return;
  }

  let csv = `"Descrição","Quantidade","Unidade"\n`;

  itens.forEach(item => {
    csv += `"${item.descricao}","${item.quantidade}","${item.unidade}"\n`;
  });

  document.getElementById("output").textContent = csv;
}
// Controle das abas
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});

// Dados armazenados
let materiais = JSON.parse(localStorage.getItem("materiais")) || [];
let obras = JSON.parse(localStorage.getItem("obras")) || [];
let requisicoes = JSON.parse(localStorage.getItem("requisicoes")) || [];

// Atualiza UI
function atualizarListaMateriais() {
  const ul = document.getElementById("listaMateriais");
  ul.innerHTML = "";
  materiais.forEach((mat, i) => {
    const li = document.createElement("li");
    li.textContent = mat;
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = () => {
      materiais.splice(i, 1);
      salvarMateriais();
      atualizarListaMateriais();
      atualizarSelectMateriais();
    };
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

function salvarMateriais() {
  localStorage.setItem("materiais", JSON.stringify(materiais));
}

function adicionarMaterial() {
  const input = document.getElementById("materialNome");
  const nome = input.value.trim();
  if (!nome) {
    alert("Informe o nome do material");
    return;
  }
  materiais.push(nome);
  salvarMateriais();
  atualizarListaMateriais();
  atualizarSelectMateriais();
  input.value = "";
}

// Obras
function atualizarListaObras() {
  const ul = document.getElementById("listaObras");
  ul.innerHTML = "";
  obras.forEach((obra, i) => {
    const li = document.createElement("li");
    li.textContent = obra;
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = () => {
      obras.splice(i, 1);
      salvarObras();
      atualizarListaObras();
      atualizarSelectObras();
    };
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

function salvarObras() {
  localStorage.setItem("obras", JSON.stringify(obras));
}

function adicionarObra() {
  const input = document.getElementById("obraCodigo");
  const codigo = input.value.trim();
  if (!codigo) {
    alert("Informe o código da obra");
    return;
  }
  obras.push(codigo);
  salvarObras();
  atualizarListaObras();
  atualizarSelectObras();
  input.value = "";
}

// Selects para nova requisição
function atualizarSelectMateriais() {
  const sel = document.getElementById("selMaterial");
  sel.innerHTML = "";
  materiais.forEach(mat => {
    const opt = document.createElement("option");
    opt.value = mat;
    opt.textContent = mat;
    sel.appendChild(opt);
  });
}

function atualizarSelectObras() {
  const sel = document.getElementById("selObra");
  sel.innerHTML = "";
  obras.forEach(obra => {
    const opt = document.createElement("option");
    opt.value = obra;
    opt.textContent = obra;
    sel.appendChild(opt);
  });
}

// Requisições
let itensRequisicao = [];

function adicionarItemRequisicao() {
  const selMaterial = document.getElementById("selMaterial");
  const quantidadeInput = document.getElementById("quantidade");
  const material = selMaterial.value;
  const quantidade = parseFloat(quantidadeInput.value);
  if (!material) {
    alert("Selecione um material");
    return;
  }
  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade válida");
    return;
  }
  itensRequisicao.push({ material, quantidade });
  atualizarTabelaItens();
  quantidadeInput.value = "";
}

function atualizarTabelaItens() {
  const tbody = document.querySelector("#tabelaItens tbody");
  tbody.innerHTML = "";
  itensRequisicao.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.material}</td>
      <td>${item.quantidade}</td>
      <td><button onclick="removerItemRequisicao(${i})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function removerItemRequisicao(index) {
  itensRequisicao.splice(index, 1);
  atualizarTabelaItens();
}

function salvarRequisicao() {
  const selObra = document.getElementById("selObra");
  const obra = selObra.value;
  if (!obra) {
    alert("Selecione a obra");
    return;
  }
  if (itensRequisicao.length === 0) {
    alert("Adicione ao menos um item na requisição");
    return;
  }

  const data = new Date().toLocaleDateString();
  const numero = getProximoNumeroRequisicao(obra);

  const novaReq = {
    obra,
    numero,
    data,
    itens: [...itensRequisicao]
  };

  requisicoes.push(novaReq);
  salvarRequisicoes();
  atualizarListaRequisicoes();

  // Limpa para nova requisição
  itensRequisicao = [];
  atualizarTabelaItens();
  alert(`Requisição RM-${obra}-${String(numero).padStart(3, "0")} salva!`);
}

function getProximoNumeroRequisicao(obra) {
  const chavesObra = requisicoes.filter(r => r.obra === obra);
  if (chavesObra.length === 0) return 1;
  const maior = Math.max(...chavesObra.map(r => r.numero));
  return maior + 1;
}

function salvarRequisicoes() {
  localStorage.setItem("requisicoes", JSON.stringify(requisicoes));
}

function atualizarListaRequisicoes() {
  const ul = document.getElementById("listaRequisicoes");
  ul.innerHTML = "";
  requisicoes.forEach(req => {
    const li = document.createElement("li");
    li.textContent = `RM-${req.obra}-${String(req.numero).padStart(3, "0")} - ${req.data} (${req.itens.length} itens)`;
    ul.appendChild(li);
  });
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  atualizarListaMateriais();
  atualizarListaObras();
  atualizarListaRequisicoes();
  atualizarSelectMateriais();
  atualizarSelectObras();

  // Logout
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth");
      window.location.href = "login.html";
    });
  }
});
function mostrarAba(id) {
  const abas = document.querySelectorAll(".aba");
  abas.forEach(aba => {
    aba.style.display = "none";
  });

  const abaAtiva = document.getElementById(id);
  if (abaAtiva) {
    abaAtiva.style.display = "block";
  }
}
