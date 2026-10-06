import urllib.request
from PIL import Image
from io import BytesIO

# URL do tênis
url = 'https://static.nike.com/a/images/t_default/f0fd71f6-08d6-41cf-997e-da7eb9071d2f/W%2BNIKE%2BJOURNEY%2BRUN.png'

# Baixar a imagem
print('Baixando imagem...')
response = urllib.request.urlopen(url)
img_data = response.read()
img = Image.open(BytesIO(img_data))

# Converter para RGB com fundo branco
print('Processando imagem...')
if img.mode in ('RGBA', 'LA', 'P'):
    # Criar nova imagem com fundo branco
    background = Image.new('RGB', img.size, (255, 255, 255))
    if img.mode == 'P':
        img = img.convert('RGBA')
    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
    img = background
elif img.mode != 'RGB':
    img = img.convert('RGB')

# Salvar como PNG
print('Salvando imagem...')
img.save('img/tenis-corrida.png', 'PNG')
print('Concluído! Imagem salva em img/tenis-corrida.png')
