/* Beta Presentes — visualizador de ângulos
   ===================================================================
   Duas formas de ver o mesmo arranjo, as duas feitas com fotografias
   de verdade da loja. Nenhuma delas finge ser a outra.

   1) ÂNGULOS   — as fotos que o catálogo já tem do produto (de 2 a 5,
      em distâncias e ângulos diferentes). Arraste para percorrer.
      A etiqueta diz "ângulos fotografados na loja".

   2) GIRO 360° — sequência de 24 a 36 fotos do mesmo arranjo sobre
      uma base giratória. Quando existir, entra no lugar dos ângulos
      e a etiqueta passa a dizer "giro 360°". Para ligar: fotos em
      assets/giro/<id>/01.jpg... e a lista em dados/giro.js.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------- medidas */

  function historico() {
    var pontos = [];
    return {
      anota: function (x) {
        pontos.push({ x: x, t: performance.now() });
        if (pontos.length > 6) pontos.shift();
      },
      velocidade: function () {
        if (pontos.length < 2) return 0;
        var a = pontos[0], b = pontos[pontos.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt <= 0 || dt > 0.3) return 0;
        return (b.x - a.x) / dt;
      },
      limpa: function () { pontos.length = 0; }
    };
  }

  /* para onde o gesto estava indo (desaceleração exponencial) */
  function projetar(velocidade, desaceleracao) {
    var d = desaceleracao || 0.994;
    return (velocidade / 1000) * d / (1 - d);
  }

  /* resistência progressiva nas bordas, em vez de parede */
  function elastico(excesso, tamanho) {
    var c = 0.55;
    return (excesso * tamanho * c) / (tamanho + c * Math.abs(excesso));
  }

  /* mola criticamente amortecida: sai do valor atual, herda a
     velocidade do dedo e pode ser interrompida a qualquer momento */
  function mola(de, para, v0, resposta, aoAndar, aoParar) {
    if (reduzido) { aoAndar(para); if (aoParar) aoParar(); return function () {}; }
    var w = (2 * Math.PI) / (resposta || 0.4);
    var A = de - para;
    var B = v0 + w * A;
    var t0 = performance.now();
    var id = 0;
    (function passo(agora) {
      var t = (agora - t0) / 1000;
      var e = Math.exp(-w * t);
      var x = para + (A + B * t) * e;
      if (t > 1.4 || (Math.abs(x - para) < 0.4 && Math.abs(B * e) < 6)) {
        aoAndar(para);
        if (aoParar) aoParar();
        return;
      }
      aoAndar(x);
      id = requestAnimationFrame(passo);
    })(t0);
    return function () { cancelAnimationFrame(id); };
  }

  /* ================================================ modo: giro 360° */

  function montarGiro(caixa, arquivos, legenda) {
    var total = arquivos.length;
    var tela = document.createElement("div");
    tela.className = "visor__quadros";

    var imgs = arquivos.map(function (src, i) {
      var im = new Image();
      im.src = src;
      im.alt = i === 0 ? legenda : "";
      im.loading = i < 4 ? "eager" : "lazy";
      im.decoding = "async";
      if (i === 0) im.className = "ativo";
      tela.appendChild(im);
      return im;
    });
    caixa.appendChild(tela);

    var indice = 0, posicao = 0, porQuadro = 1, parar = function () {};

    function medir() { porQuadro = Math.max(6, caixa.clientWidth / total); }
    medir();
    window.addEventListener("resize", medir);

    function mostrar(i) {
      var n = ((Math.round(i) % total) + total) % total;
      if (n === indice) return;
      imgs[indice].classList.remove("ativo");
      imgs[n].classList.add("ativo");
      indice = n;
    }

    var h = historico(), arrastando = false, x0 = 0, base = 0, ponteiro = null;

    caixa.addEventListener("pointerdown", function (e) {
      parar();
      arrastando = true;
      ponteiro = e.pointerId;
      caixa.setPointerCapture(e.pointerId);
      x0 = e.clientX; base = posicao;
      h.limpa(); h.anota(e.clientX);
      caixa.classList.add("esta-girando", "ja-mexeu");
    });

    caixa.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      h.anota(e.clientX);
      posicao = base + (e.clientX - x0) / porQuadro;
      mostrar(posicao);
    });

    function soltar() {
      if (!arrastando) return;
      arrastando = false;
      caixa.classList.remove("esta-girando");
      if (ponteiro !== null) { try { caixa.releasePointerCapture(ponteiro); } catch (_) {} ponteiro = null; }
      var v = h.velocidade() / porQuadro;
      var destino = posicao + projetar(v * 1000, 0.991) / 1000;
      if (Math.abs(destino - posicao) < 0.4) return;
      parar = mola(posicao, destino, v, 0.55, function (x) {
        posicao = x; mostrar(x);
      });
    }
    caixa.addEventListener("pointerup", soltar);
    caixa.addEventListener("pointercancel", soltar);

    teclado(caixa, function (passo) {
      parar();
      posicao += passo;
      mostrar(posicao);
      caixa.classList.add("ja-mexeu");
    }, "Giro de 360° do arranjo. Use as setas para girar.");

    etiqueta(caixa, "Giro 360° · fotos do produto");
    dica(caixa, "Arraste para girar");

    return { modo: "giro", total: total, ir: function (i) { posicao = i; mostrar(i); } };
  }

  /* ================================================= modo: ângulos */

  function montarAngulos(caixa, fotos, legenda, aoMudar) {
    var total = fotos.length;

    var trilho = document.createElement("div");
    trilho.className = "visor__trilho";
    fotos.forEach(function (src, i) {
      var q = document.createElement("div");
      q.className = "visor__quadro";
      var im = new Image();
      im.src = src;
      im.alt = i === 0 ? legenda : legenda + " — ângulo " + (i + 1);
      im.loading = i < 2 ? "eager" : "lazy";
      im.decoding = "async";
      if (i === 0) im.setAttribute("fetchpriority", "high");
      q.appendChild(im);
      trilho.appendChild(q);
    });
    caixa.appendChild(trilho);

    var indice = 0;
    var deslocamento = 0;   /* em pixels, 0 = primeiro ângulo */
    var largura = 1;
    var parar = function () {};

    function medir() { largura = caixa.clientWidth || 1; aplicar(indice * -largura); }
    function aplicar(px) {
      deslocamento = px;
      trilho.style.transform = "translate3d(" + px + "px,0,0)";
    }

    medir();
    window.addEventListener("resize", medir);

    function assentar(i, velocidade) {
      var antes = indice;
      indice = Math.max(0, Math.min(total - 1, i));
      parar();
      parar = mola(deslocamento, indice * -largura, velocidade || 0, 0.42, aplicar);
      if (indice !== antes && aoMudar) aoMudar(indice);
      if (indice !== antes && !aoMudar) sincronizar();
    }

    function sincronizar() {}

    var h = historico(), arrastando = false, x0 = 0, base = 0, ponteiro = null, decidiu = false, y0 = 0;

    caixa.addEventListener("pointerdown", function (e) {
      if (total < 2) return;
      parar();
      arrastando = true;
      decidiu = e.pointerType !== "touch";
      ponteiro = e.pointerId;
      caixa.setPointerCapture(e.pointerId);
      x0 = e.clientX; y0 = e.clientY; base = deslocamento;
      h.limpa(); h.anota(e.clientX);
      caixa.classList.add("ja-mexeu");
      if (decidiu) caixa.classList.add("esta-girando");
    });

    caixa.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;

      /* no toque, espera 10px para saber se é arraste lateral ou rolagem */
      if (!decidiu) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx)) { arrastando = false; return; }
        decidiu = true;
        caixa.classList.add("esta-girando");
      }

      h.anota(e.clientX);
      var bruto = base + dx;
      var min = (total - 1) * -largura, max = 0;
      if (bruto > max) bruto = max + elastico(bruto - max, largura);
      if (bruto < min) bruto = min - elastico(min - bruto, largura);
      aplicar(bruto);
    });

    function soltar() {
      if (!arrastando) return;
      arrastando = false;
      caixa.classList.remove("esta-girando");
      if (ponteiro !== null) { try { caixa.releasePointerCapture(ponteiro); } catch (_) {} ponteiro = null; }
      if (!decidiu) return;
      var v = h.velocidade();
      var projetado = deslocamento + projetar(v, 0.9935);
      assentar(Math.round(-projetado / largura), v);
    }
    caixa.addEventListener("pointerup", soltar);
    caixa.addEventListener("pointercancel", soltar);

    teclado(caixa, function (passo) {
      assentar(indice + (passo > 0 ? 1 : -1), 0);
    }, legenda + ". " + total + " ângulos fotografados na loja. Use as setas para percorrer.");

    etiqueta(caixa, total + " ângulos da loja");
    if (total > 1) dica(caixa, "Arraste para ver os outros ângulos");

    return {
      modo: "angulos",
      total: total,
      ir: function (i) { assentar(i, 0); },
      indice: function () { return indice; }
    };
  }

  /* ------------------------------------------------------- enfeites */

  function teclado(caixa, mover, rotulo) {
    caixa.tabIndex = 0;
    caixa.setAttribute("role", "group");
    caixa.setAttribute("aria-label", rotulo);
    caixa.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { mover(1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { mover(-1); e.preventDefault(); }
    });
  }

  function etiqueta(caixa, texto) {
    var e = document.createElement("span");
    e.className = "visor__etiqueta";
    e.textContent = texto;
    caixa.appendChild(e);
  }

  function dica(caixa, texto) {
    var d = document.createElement("span");
    d.className = "visor__dica";
    d.innerHTML =
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg><span>' + texto + "</span>";
    caixa.appendChild(d);
  }

  /* --------------------------------------------------------- fachada */

  window.Visor = {
    /* opcoes: { fotos: [...], id, legenda, aoMudar } */
    montar: function (caixa, opcoes) {
      var o = opcoes || {};
      var legenda = o.legenda || "Arranjo da Beta Presentes";

      var giro = window.BETA_GIRO && window.BETA_GIRO[o.id];
      var fotos = o.fotos || [];
      var usaGiro = giro && giro.length >= 8;
      if (!usaGiro && fotos.length < 2) return null;

      caixa.classList.add("visor");
      var inicial = caixa.querySelector(".visor__inicial");
      if (inicial) inicial.parentNode.removeChild(inicial);

      return usaGiro
        ? montarGiro(caixa, giro, legenda)
        : montarAngulos(caixa, fotos, legenda, o.aoMudar);
    }
  };
})();
