/**
 * Script puro para processamento Client-Side de Imagens.
 * Redimensiona e aplica a marca d'água no canto inferior direito.
 */
export async function processAndWatermarkImage(
  file: File,
  username: string = "Sunset App"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // Cleanup
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas não suportado.");

      // Limitar largura máxima a 1080px (economia de banda pro Supabase)
      const MAX_WIDTH = 1080;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.floor((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar a foto base
      ctx.drawImage(img, 0, 0, width, height);

      // --- Adicionar a Marca d'Água (Visual Estilo Instagram) ---
      const fontSize = Math.max(16, Math.floor(width * 0.035)); 
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      // Sombra preta para dar contraste em fundos claros
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "white";
      ctx.textAlign = "right";
      
      const text = `📍 ${username}`;
      
      // Desenha o texto no canto inferior direito, com um padding
      const padding = 20;
      ctx.fillText(text, width - padding, height - padding);

      // --- Fim da Marca d'Água ---

      // Exportar como Blob Comprimido (JPEG 80% de qualidade)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Erro ao comprimir imagem.");
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => reject("Erro ao ler imagem.");
    img.src = url;
  });
}
