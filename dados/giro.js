/* ===================================================================
   GIRO 360° FOTOGRÁFICO — registro das sequências de fotos
   ===================================================================

   Hoje o catálogo da Beta Presentes tem de 1 a 5 fotos por produto,
   em ângulos e distâncias diferentes, mas não sequenciais. Com isso
   NÃO dá para montar um giro fotográfico honesto, então as páginas
   de produto usam o visor de ângulos: arrasta-se entre as fotos que
   existem de fato, e a etiqueta diz quantas são.

   COMO LIGAR O GIRO FOTOGRÁFICO DE UM PRODUTO
   -------------------------------------------
   1. Fotografe o arranjo sobre uma base giratória, com a câmera fixa,
      luz constante e fundo liso. Faça de 24 a 36 fotos, uma a cada
      10° ou 15°, sempre no mesmo enquadramento.
   2. Salve as fotos em  assets/giro/<id do produto>/  com nomes em
      ordem: 01.jpg, 02.jpg, 03.jpg ...
   3. Registre a lista aqui embaixo. O site troca sozinho: passa a
      mostrar o giro real e a etiqueta muda para "fotos do produto".

   EXEMPLO (basta descomentar e ajustar o id e a quantidade):

   window.BETA_GIRO = {
     3401869: quadros(3401869, 36)
   };
   =================================================================== */

function quadros(id, total, pasta) {
  var lista = [];
  for (var i = 1; i <= total; i++) {
    lista.push((pasta || (window.BETA_BASE || "") + "assets/giro/") + id + "/" + String(i).padStart(2, "0") + ".jpg");
  }
  return lista;
}

window.BETA_GIRO = {};
