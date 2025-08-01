let materiais = JSON.parse(localStorage.getItem("materiais") || "[]");
let obras = JSON.parse(localStorage.getItem("obras") || "[]");
let requisicoes = JSON.parse(localStorage.getItem("requisicoes") || "[]");
let requisicaoAtual = [];
let requisicaoEditIndex = null;

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll("nav button").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");

  if (tabId === "catalogo") renderMateriais();
  if (tabId === "obras") renderObras();
  if (tabId === "historico") renderHistorico();
  if (tabId === "requisicao") {
    renderSelectObras();
    renderSelectMateriais();
    renderTabelaRequisicao();
  }
}

function cadastrarMaterial() {
  const desc = document.getElementById("descMaterial").value.trim();
  const unid = document.getElementById("unidMaterial").value.trim();
  if (!desc || !unid) {
    alert("Preencha descrição e unidade do material.");
    return;
  }
  materiais.push({ descricao: desc, unidade: unid });
  localStorage.setItem("materiais", JSON.stringify(materiais));
  document.getElementById("descMaterial").value = "";
  document.getElementById("unidMaterial").value = "";
  renderMateriais();
  renderSelectMateriais();
  alert("Material cadastrado com sucesso!");
}

function renderMateriais() {
  const ul = document.getElementById("listaMateriais");
  ul.innerHTML = materiais.map((m) => `<li>${m.descricao} (${m.unidade})</li>`).join("");
}

function cadastrarObra() {
  const nome = document.getElementById("nomeObra").value.trim();
  if (!nome) {
    alert("Informe o nome da obra.");
    return;
  }
  const codigo = `OB-${String(obras.length + 1).padStart(3, "0")}`;
  obras.push({ nome, codigo });
  localStorage.setItem("obras", JSON.stringify(obras));
  document.getElementById("nomeObra").value = "";
  renderObras();
  renderSelectObras();
  alert("Obra cadastrada com sucesso!");
}

function renderObras() {
  const ul = document.getElementById("listaObras");
  ul.innerHTML = obras.map((o) => `<li>${o.codigo} - ${o.nome}</li>`).join("");
}

function renderSelectMateriais() {
  const sel = document.getElementById("materialSelect");
  sel.innerHTML = materiais
    .map((m, i) => `<option value="${i}">${m.descricao} (${m.unidade})</option>`)
    .join("");
}

function renderSelectObras() {
  const sel = document.getElementById("obraSelect");
  sel.innerHTML = obras
    .map((o, i) => `<option value="${i}">${o.codigo} - ${o.nome}</option>`)
    .join("");
}

function adicionarItem() {
  const materialIndex = document.getElementById("materialSelect").value;
  const qtd = document.getElementById("quantidadeInput").value;
  if (materialIndex === "" || qtd === "" || qtd <= 0) {
    alert("Selecione o material e informe uma quantidade válida.");
    return;
  }
  const mat = materiais[materialIndex];
  requisicaoAtual.push({ descricao: mat.descricao, unidade: mat.unidade, quantidade: qtd });
  renderTabelaRequisicao();
  document.getElementById("quantidadeInput").value = "";
}

function renderTabelaRequisicao() {
  const tbody = document.querySelector("#tabelaRequisicao tbody");
  tbody.innerHTML = requisicaoAtual
    .map(
      (item, i) => `
    <tr>
      <td>${item.descricao}</td>
      <td>${item.unidade}</td>
      <td>${item.quantidade}</td>
      <td><button class="small" onclick="removerItem(${i})">Remover</button></td>
    </tr>`
    )
    .join("");
}

function removerItem(i) {
  requisicaoAtual.splice(i, 1);
  renderTabelaRequisicao();
}

function salvarRequisicao() {
  const obraIndex = document.getElementById("obraSelect").value;
  if (obraIndex === "") {
    alert("Por favor, selecione uma obra.");
    return;
  }
  if (requisicaoAtual.length === 0) {
    alert("Adicione pelo menos um item na requisição.");
    return;
  }
  const obra = obras[obraIndex];
  let requisicoesSalvas = JSON.parse(localStorage.getItem("requisicoes") || "[]");

  if (requisicaoEditIndex !== null) {
    requisicoesSalvas[requisicaoEditIndex] = {
      ...requisicoesSalvas[requisicaoEditIndex],
      obra: obra.codigo,
      data: new Date().toLocaleString(),
      itens: [...requisicaoAtual],
    };
    alert(`Requisição ${requisicoesSalvas[requisicaoEditIndex].codigo} atualizada com sucesso!`);
    requisicaoEditIndex = null;
  } else {
    const codigoRequisicao = `RM-${obra.codigo}-${String(requisicoesSalvas.length + 1).padStart(4, "0")}`;
    const novaReq = {
      codigo: codigoRequisicao,
      obra: obra.codigo,
      data: new Date().toLocaleString(),
      itens: [...requisicaoAtual],
    };
    requisicoesSalvas.push(novaReq);
    alert(`Requisição ${codigoRequisicao} salva com sucesso!`);
  }

  localStorage.setItem("requisicoes", JSON.stringify(requisicoesSalvas));
  requisicaoAtual = [];
  renderTabelaRequisicao();
  showTab("historico");
}

function renderHistorico() {
  const div = document.getElementById("historicoRequisicoes");
  let requisicoesSalvas = JSON.parse(localStorage.getItem("requisicoes") || "[]");
  if (requisicoesSalvas.length === 0) {
    div.innerHTML = "<p>Nenhuma requisição salva.</p>";
    return;
  }
  div.innerHTML = requisicoesSalvas
    .map((r, i) => {
      const obra = obras.find((o) => o.codigo === r.obra);
      const nomeObra = obra ? obra.nome : r.obra;
      return `
      <div style="margin-bottom: 15px; border: 1px solid #ccc; padding: 10px; background: #fff;">
        <strong>${r.codigo}</strong> - <em>${nomeObra}</em> - <small>${r.data}</small>
        <button class="small" onclick="editarRequisicao(${i})">Editar</button>
        <ul>
          ${r.itens.map((item) => `<li>${item.quantidade} ${item.unidade} - ${item.descricao}</li>`).join("")}
        </ul>
      </div>`;
    })
    .join("");
}

function editarRequisicao(index) {
  let requisicoesSalvas = JSON.parse(localStorage.getItem("requisicoes") || "[]");
  const req = requisicoesSalvas[index];
  if (!req) {
    alert("Requisição não encontrada.");
    return;
  }
  requisicaoEditIndex = index;
  const obraIndex = obras.findIndex((o) => o.codigo === req.obra);
  if (obraIndex === -1) {
    alert("Obra da requisição não encontrada.");
    return;
  }
  document.getElementById("obraSelect").value = obraIndex;
  requisicaoAtual = [...req.itens];
  renderTabelaRequisicao();
  showTab("requisicao");
}

// Inicialização
renderSelectObras();
renderSelectMateriais();
renderObras();
renderMateriais();
