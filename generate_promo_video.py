import os
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw

FFMPEG_BIN = "/Users/davidrip/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

def create_sneaker_reel(output_path="assets/vanessa_castellar_reel_9x16.mp4"):
    width, height = 720, 1280
    fps = 30
    duration_per_slide = 2.5 # segundos por modelo
    
    shoes = [
        {
            "img": "assets/images/jordan_4_military_black.jpg",
            "brand": "JORDAN RETRO",
            "name": "Air Jordan 4 Military Black",
            "price": "$250.000 COP",
            "tag": "🔥 MÁS VENDIDO CALI",
            "sizes": "TALLAS 38 A 44"
        },
        {
            "img": "assets/images/nike_initiator_babyblue.jpg",
            "brand": "NIKE RUNNING",
            "name": "Nike Initiator Baby Blue Dama",
            "price": "$185.000 COP",
            "tag": "✨ TENDENCIA 2026",
            "sizes": "TALLAS 35 A 39"
        },
        {
            "img": "assets/images/on_cloudmonster_olive.jpg",
            "brand": "ON RUNNING SUIZA",
            "name": "On Cloudmonster Ref 749 B",
            "price": "$255.000 COP",
            "tag": "⚡ MÁXIMO CONFORT",
            "sizes": "TALLAS 35 A 40"
        },
        {
            "img": "assets/images/adidas_samba_corduroy.jpg",
            "brand": "ADIDAS ORIGINALS",
            "name": "Samba OG Corduroy Velvet",
            "price": "$195.000 COP",
            "tag": "🎨 EDICIÓN ESPECIAL",
            "sizes": "TALLAS 35 A 39"
        }
    ]

    frames_per_slide = int(duration_per_slide * fps)
    total_frames = int(len(shoes) * frames_per_slide)
    
    print(f"🎬 Compilando video H.264 9:16 con FFmpeg para compatibilidad universal web...")

    # Comando FFmpeg con H.264 (libx264) y pixel format yuv420p
    ffmpeg_cmd = [
        FFMPEG_BIN,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "rgb24",
        "-r", str(fps),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output_path
    ]

    pipe = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    for s_idx, shoe in enumerate(shoes):
        img_path = shoe["img"]
        if not os.path.exists(img_path):
            continue
            
        pil_shoe_orig = Image.open(img_path).convert("RGBA")
        
        for f in range(frames_per_slide):
            progress = f / float(frames_per_slide)
            
            # 1. Fondo Oscuro Cyberpunk con degradado y partículas
            frame_img = Image.new("RGBA", (width, height), (7, 8, 14, 255))
            draw = ImageDraw.Draw(frame_img)
            
            # Halo de Luz Ambiental en el centro
            glow_radius = int(320 + math.sin(progress * math.pi * 2) * 25)
            glow_box = [width//2 - glow_radius, height//2 - glow_radius, width//2 + glow_radius, height//2 + glow_radius]
            draw.ellipse(glow_box, fill=(22, 28, 52, 220), outline=(227, 194, 116, 70), width=3)
            
            # 2. Efecto Zoom Dinámico / Ken Burns en la zapatilla
            zoom_scale = 1.0 + (progress * 0.12)
            shoe_w = int(590 * zoom_scale)
            shoe_h = int(590 * zoom_scale)
            shoe_resized = pil_shoe_orig.resize((shoe_w, shoe_h), Image.Resampling.LANCZOS)
            
            # Posición centrada con flotación suave
            offset_y = int(math.sin(progress * math.pi * 2) * 12)
            shoe_x = (width - shoe_w) // 2
            shoe_y = (height - shoe_h) // 2 - 40 + offset_y
            
            frame_img.paste(shoe_resized, (shoe_x, shoe_y), shoe_resized)
            
            # 3. Overlays Gráficos
            # Header Superior: Vanessa Castellar Shoes
            draw.rectangle([0, 0, width, 140], fill=(12, 14, 20, 245))
            draw.line([0, 140, width, 140], fill=(227, 194, 116, 220), width=3)
            draw.text((width//2 - 195, 30), "VANESSA CASTELLAR", fill=(255, 255, 255), font_size=32)
            draw.text((width//2 - 135, 70), "SHOES · BODEGA CALI", fill=(227, 194, 116), font_size=20)
            draw.text((width//2 - 175, 100), "⚡ 5 LÍNEAS DE WHATSAPP ACTIVAS", fill=(56, 189, 248), font_size=16)
            
            # Badge de Tendencia
            draw.rectangle([40, 180, 330, 225], fill=(227, 194, 116, 240))
            draw.text((55, 190), shoe["tag"], fill=(0, 0, 0), font_size=20)
            
            # Nombre de la Marca y Modelo
            draw.text((40, 840), shoe["brand"], fill=(56, 189, 248), font_size=22)
            draw.text((40, 875), shoe["name"], fill=(255, 255, 255), font_size=34)
            draw.text((40, 930), shoe["sizes"], fill=(180, 180, 200), font_size=20)
            
            # Caja de Precio y Llamado a la Acción (CTA)
            draw.rectangle([40, 980, width - 40, 1070], fill=(22, 27, 46, 245), outline=(227, 194, 116, 200), width=2)
            draw.text((65, 995), "PRECIO POR PAR:", fill=(180, 180, 200), font_size=18)
            draw.text((65, 1020), shoe["price"], fill=(227, 194, 116), font_size=36)
            draw.text((width - 320, 1015), "🔥 ENVIOS CONTRAENTREGA", fill=(74, 222, 128), font_size=18)
            
            # Footer CTA
            draw.rectangle([0, 1150, width, height], fill=(10, 10, 15, 255))
            draw.text((width//2 - 240, 1175), "📲 PIDE AHORA AL WHATSAPP DE BODEGA", fill=(255, 255, 255), font_size=22)
            draw.text((width//2 - 160, 1215), "✨ Powered by BASTION AI", fill=(227, 194, 116), font_size=16)
            
            # Convertir a RGB raw bytes y escribir a stdin de FFmpeg
            rgb_frame = frame_img.convert("RGB")
            pipe.stdin.write(rgb_frame.tobytes())

    pipe.stdin.close()
    pipe.wait()
    print(f"✅ Video H.264 9:16 generado con éxito en: {output_path}")

if __name__ == "__main__":
    create_sneaker_reel()
