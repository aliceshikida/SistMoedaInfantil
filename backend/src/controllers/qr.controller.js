import QRCode from "qrcode";
import { prisma } from "../prisma/client.js";

/** PNG do QR do cupom (público, para exibir em e-mails e validação presencial). */
export async function cupomQrHandler(req, res, next) {
  try {
    const codigo = String(req.params.codigo ?? "").trim();
    if (!codigo) {
      return res.status(400).json({ message: "Código do cupom é obrigatório." });
    }

    const cupom = await prisma.cupom.findUnique({ where: { codigo } });
    if (!cupom) {
      return res.status(404).json({ message: "Cupom não encontrado." });
    }

    const png = await QRCode.toBuffer(codigo, {
      type: "png",
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(png);
  } catch (error) {
    next(error);
  }
}
