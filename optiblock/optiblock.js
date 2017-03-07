inicioThreshold = 100;
fimThreshold = 255;
intervalo = 10;
removeIframe = true;

imagensRemovidas = [];
palavrasEncontradas = [];
nroImg = 1;
urlCore = window.location.href.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i)[1];

$(document).ready(function() {
	console.info("Optiblock start\nIntervalo: " + intervalo + " (" + (Math.ceil((fimThreshold-inicioThreshold)/intervalo) * 2) + " cópias por imagem)");
	var imagens = $("img");	
	arrayImg = filterImg(imagens);	
	if (removeIframe) {
		$("iframe").remove();
	}
	console.info("Imagens detectadas: " + arrayImg.length);
	//console.info(arrayImg);
	if (arrayImg.length > 0) {
		$(arrayImg).each(function(k, img) {
			img.setAttribute('nro_img', nroImg);
			for (i = inicioThreshold; i <= fimThreshold; i+= intervalo) {
				vars = createCanvas(img);
				canvas = vars[0];
				ctx = vars[1];
				imgElement = createImage();
				imgElementNeg = createImage();
				
				threshold(ctx, canvas, imgElement, img, i);	
			    negativo(ctx, canvas, imgElementNeg, imgElement);
			}
			nroImg++;
		});			
		imgsOpti = $(".optiblock_img");
		if (imgsOpti.length > 0) {
			alert("Imagens processadas com sucesso, pressione OK para continuar.");
			$(imgsOpti).each(function(k, img) {
				numero_imagem = $(img).attr('nro_img');
				if (imagensRemovidas.indexOf(numero_imagem) == -1) {
					palavra = read(img);
					if (checkBlacklist(palavra, img)) {
						$("img[nro_img='"+ $(img).attr('nro_img') +"']").remove();
						imagensRemovidas.push(numero_imagem);
					}	
				}
			});
			console.info("Imagens removidas: " + imagensRemovidas.length + " (" + parseFloat((imagensRemovidas.length*100)/arrayImg.length).toFixed(2) + "%)");
			console.info("Palavras: " + palavrasEncontradas.join(', '));
			$(".optiblock_img").remove();
		}
	}	
});

function canvasToImg(img, canvas, imgElement) {
	 imgElement.src = canvas.toDataURL();
	 $(imgElement).insertAfter(img);	 
}

function checkBlacklist(palavra, imagem) {
	found = false;
	$(getBlacklist()).each(function(k, v) {
		if (palavra.indexOf(v) >= 0) {
			palavrasEncontradas.push(v);
			found = true;
			return false;
		}
	});
	return found;
}

function createCanvas(img) {
	 $("#optiblock_canvas").remove();
	 var canvas = document.createElement("canvas");
	 var ctx = canvas.getContext('2d');
	 ctx.canvas.width = img.width + 50;
	 ctx.canvas.height = img.height;
	 ctx.canvas.id = "optiblock_canvas";
	 ctx.drawImage(img, 0, 0);
	 return [canvas, ctx];
}

function createImage() {
	imageBlank = document.createElement("img");
	imageBlank.className = "optiblock_img";
	imageBlank.setAttribute('nro_img', nroImg);
	return imageBlank;
}
 
function filterImg(imagens) {
	var imagensFilter = [];
	$(imagens).each(function(k, v) {
	  if ($(v).width() > 32 && $(v).height() > 1 && $(v).css('display') != 'none') {
		parentHref = $(v).parent().attr('href') || "";
		src = $(v).attr("src") || "";
		//console.info(src);
		if (parentHref.indexOf(urlCore) == -1 && ((parentHref.indexOf('http') >= 0 && src.indexOf(urlCore) >= 0) || (src.indexOf('http') == -1)) && 
			!(parentHref.indexOf('http') == -1 && src.indexOf('http') == -1) && parentHref != 'index.php' && parentHref != '/') {
			imagensFilter.push(v);
		}
	  }
	});
	return imagensFilter;
}
 
function getBlacklist() {
	var lista = ["acesse", "agora", "anuncie", "aqui", "assine", "buy", "click", "clique", "corra", "compre", "comprar", "confira", "conheça", "conheca", "descubra", 
	"download", "evite", "fat", "free", "frete", "gordura", "grátis", "gratis", "imobiliaria", "instalar", "já", "ja", "join", "ligue", "mais", "moda", "more", "monitor", "now", "participe", 
	"peso", "precis", "saiba", "seguros", "shoes", "suzuki", "taxa", "veja", "velocidade", "venda", "volkswagen", "view", "watch", "zero"];
	return lista;
}

function negativo(ctx, canvas, imgElement, img) {
	 var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
	 for (var i = 0; i < imageData.data.length; i+=4) {
          imageData.data[i] = 255 - imageData.data[i];
          imageData.data[i + 1] = 255 - imageData.data[i + 1];
          imageData.data[i + 2] = 255 - imageData.data[i + 2];
     }
	 ctx.putImageData(imageData, 0, 0);
	 canvasToImg(img, canvas, imgElement);
}

function read(img) {
	var string = OCRAD(img);
	//console.info(string);
	newString = removeLixo(string);
	//console.info(newString);
	return newString;
}

function removeLixo(string) {
	return string.trim().replace(/[^a-zA-Z]+/, '').toLowerCase();
}

function threshold(ctx, canvas, imgElement, img, threshold) { 
	 var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
	 for (var i = 0; i < imageData.data.length; i+=4) {
		 imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = imageData.data[i] > threshold ? 255 : 0;
	 }
	 ctx.putImageData(imageData, 0, 0);
	 canvasToImg(img, canvas, imgElement);
}