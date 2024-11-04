let originalOrder = []; // Armazena a ordem original das linhas
let lastSortedColumn = null; // Índice da última coluna ordenada

// Salva a ordem original das linhas ao carregar a página
window.onload = function() {
  const table = document.getElementById("sortableTable");
  if (table) {
    originalOrder = Array.from(table.rows).slice(1); // Exclui a primeira linha (cabeçalho)
  }
};

function sortTable(columnIndex, button) {
  const table = document.getElementById("sortableTable");

  // Reseta a tabela para a ordem original antes de aplicar nova ordenação
  if (table) {
    originalOrder.forEach(row => table.appendChild(row));
    
    // Verifica se é a mesma coluna para alternar entre ordenação crescente e estado original
    if (columnIndex === lastSortedColumn) {
      // Reseta a opacidade dos botões para 0.6
      document.querySelectorAll('.ordenar').forEach(btn => btn.style.opacity = 0.6);

      // Marca que nenhuma coluna está sendo ordenada no momento
      lastSortedColumn = null;
      return;
    }

    const rows = Array.from(table.rows).slice(1); // Exclui a primeira linha (cabeçalho)

    // Ordenação em ordem crescente
    rows.sort((rowA, rowB) => {
      const cellA = rowA.cells[columnIndex].innerText.toLowerCase();
      const cellB = rowB.cells[columnIndex].innerText.toLowerCase();

      if (cellA < cellB) return -1;
      if (cellA > cellB) return 1;
      return 0;
    });

    // Rearranja as linhas na tabela conforme a nova ordem
    rows.forEach(row => table.appendChild(row));

    // Define todos os botões com `opacity: 0.6`
    const buttons = document.querySelectorAll('.ordenar');
    buttons.forEach(btn => btn.style.opacity = 0.5);

    // Define o botão clicado com `opacity: 1`
    button.style.opacity = 1;

    // Define a última coluna ordenada
    lastSortedColumn = columnIndex;
  }
}
