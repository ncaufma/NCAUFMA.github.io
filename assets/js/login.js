'use strict';

$(function() {

	$("input[type='password'][data-eye]").each(function(i) {
		var $this = $(this),
			id = 'eye-password-' + i,
			el = $('#' + id);

		$this.wrap($("<div/>", {
			style: 'position:relative',
			id: id
		}));

		$this.css({
			paddingRight: 40
		});

		// Adiciona o ícone de olho
		$this.after($("<div/>", {
			class: 'btn btn-sm',
			id: 'passeye-toggle-' + i,
		}).css({
				position: 'absolute',
				right: 10,
				top: ($this.outerHeight() / 2) - 12,
				cursor: 'pointer',
				fontSize: 18,
		}).html('<i class="fa-solid fa-eye-slash"></i>')); // Ícone inicial para senha oculta

		// Campo oculto para sincronizar o valor da senha
		$this.after($("<input/>", {
			type: 'hidden',
			id: 'passeye-' + i
		}));

	
		$this.on("keyup paste", function() {
			$("#passeye-" + i).val($(this).val());
		});

		// Alterna entre os ícones e visibilidade da senha
		$("#passeye-toggle-" + i).on("click", function() {
			if ($this.hasClass("show")) {
				$this.attr('type', 'password');
				$this.removeClass("show");
				$(this).html('<i class="fa-solid fa-eye-slash"></i>'); // Muda para ícone de olho fechado
			} else {
				$this.attr('type', 'text');
				$this.val($("#passeye-" + i).val());				
				$this.addClass("show");
				$(this).html('<i class="fa-solid fa-eye"></i>'); // Muda para ícone de olho aberto
			}
		});
	});

	
});

$(document).ready(function () {
  $('.my-login-validation').on('submit', function (event) {
    var form = this;

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      $(form).addClass('was-validated'); // Adiciona a classe apenas se houver erro
    }
  });
});


