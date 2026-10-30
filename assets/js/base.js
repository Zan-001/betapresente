/* Beta Presentes — comportamento comum a todas as páginas
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var LOJA = (window.BETA_LOJA = {
    nome: "Beta Presentes",
    zap: "5511971697239",
    zapVisivel: "(11) 97169-7239",
    instagram: "betapresente",
    rua: "R. dos Lírios, 710 — Sala 3",
    bairro: "Portais (Polvilho)",
    cidade: "Cajamar",
    uf: "SP",
    cnpj: "52.715.677/0001-00"
  });

  /* Link de pedido pelo WhatsApp -------------------------------------- */
  window.linkZap = function (texto) {
    var msg = texto || "Olá! Vim pelo site e gostaria de fazer um pedido.";
    return "https://wa.me/" + LOJA.zap + "?text=" + encodeURIComponent(msg);
  };

  window.precoBR = function (v) {
    if (v === null || v === undefined || v === "") return "";
    return "R$ " + Number(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  /* Altura real do cabeçalho -------------------------------------------
     A barra de filtros e o palco do produto grudam logo abaixo dele.
     Com valor fixo sobra ou falta 1px conforme a largura da tela, e
     aparece uma fresta de conteúdo passando por trás. */
  var barraTopo = document.querySelector(".topo");
  if (barraTopo) {
    var medirTopo = function () {
      document.documentElement.style.setProperty(
        "--altura-topo",
        /* floor, não ceil: é melhor a barra encostar 1px por baixo do
           cabeçalho (que é opaco e fica por cima) do que deixar uma
           fresta por onde o conteúdo passa */
        Math.floor(barraTopo.getBoundingClientRect().height) + "px"
      );
    };
    medirTopo();
    window.addEventListener("resize", medirTopo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTopo);
  }

  /* Menu do celular ---------------------------------------------------- */
  var botaoMenu = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");
  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", function () {
      var aberto = menu.getAttribute("data-aberto") === "sim";
      menu.setAttribute("data-aberto", aberto ? "nao" : "sim");
      botaoMenu.setAttribute("aria-expanded", String(!aberto));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.setAttribute("data-aberto", "nao");
        botaoMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Entrada das seções — escalonada, uma vez só ------------------------ */
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function prepararSurgimento(raiz) {
    var alvos = (raiz || document).querySelectorAll("[data-surge]");
    if (!alvos.length) return;
    if (reduzido || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(alvos, function (el) {
        el.classList.add("surge", "chegou");
      });
      return;
    }
    /* o estado inicial é posto de uma vez, antes de qualquer observação:
       assim a transição existe sem depender de um quadro de animação
       (que não roda em aba oculta). */
    Array.prototype.forEach.call(alvos, function (el) {
      el.classList.add("surge");
      var filhos = el.querySelectorAll("[data-surge-filho]");
      Array.prototype.forEach.call(filhos, function (f, i) {
        f.classList.add("surge");
        f.style.setProperty("--atraso", Math.min(i, 8) * 70 + "ms");
      });
    });

    function revelar(el) {
      el.classList.add("chegou");
      Array.prototype.forEach.call(el.querySelectorAll("[data-surge-filho]"), function (f) {
        f.classList.add("chegou");
      });
    }

    var olho = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (ent) {
          if (!ent.isIntersecting) return;
          revelar(ent.target);
          olho.unobserve(ent.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    Array.prototype.forEach.call(alvos, function (el) {
      olho.observe(el);
    });

    /* rede de segurança: nada fica invisível por causa do script */
    setTimeout(function () {
      Array.prototype.forEach.call(alvos, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) revelar(el);
      });
    }, 1600);
  }

  window.prepararSurgimento = prepararSurgimento;
  prepararSurgimento(document);

  /* Deriva lenta da foto da capa (uma imagem em movimento) ------------- */
  var fotoCapa = document.querySelector(".capa__foto img");
  if (fotoCapa && !reduzido) {
    var ticando = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticando) return;
        ticando = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 900);
          fotoCapa.style.transform = "scale(1.06) translate3d(0," + y * -0.045 + "px,0)";
          ticando = false;
        });
      },
      { passive: true }
    );
  }

  /* Preenche os links de WhatsApp marcados ----------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-zap]"), function (a) {
    a.href = window.linkZap(a.getAttribute("data-zap") || "");
    a.rel = "noopener";
    a.target = "_blank";
  });

  /* Marca o item de menu da página atual ------------------------------- */
  var aqui = location.pathname.split("/").pop() || "index.html";
  Array.prototype.forEach.call(document.querySelectorAll(".menu a"), function (a) {
    var alvo = (a.getAttribute("href") || "").split("/").pop();
    if (alvo === aqui) a.setAttribute("aria-current", "page");
  });
})();
