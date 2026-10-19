"""Imagen -> modelo 3D con TRELLIS (Hugging Face Space gratuito), solo con la biblioteca estándar.

No instala nada: habla con el Space por el protocolo de cola de Gradio 5 (queue/join + SSE),
el mismo que usa su página web. Pasos: abrir sesión, subir la imagen, quitarle el fondo
(preprocess_image), generar forma + textura (generate_and_extract_glb) y descargar el GLB.
El cálculo pesado se hace en la GPU del Space; aquí solo se mueven unos pocos MB de red.

Uso: python generar_3d.py imagen.jpg salida.glb [semilla]
"""
import json, sys, time, uuid, urllib.request

BASE = 'https://trellis-community-trellis.hf.space'
API = f'{BASE}/gradio_api'
UA = {'User-Agent': 'torre-morvath/1.0'}
# índices de función (fn_index) según /config del Space
FN = {'start_session': 4, 'preprocess_image': 8, 'generate_and_extract_glb': 11}


def subir(ruta):
    limite = uuid.uuid4().hex
    cuerpo = (f'--{limite}\r\nContent-Disposition: form-data; name="files"; filename="imagen.jpg"\r\n'
              f'Content-Type: image/jpeg\r\n\r\n').encode() + open(ruta, 'rb').read() + f'\r\n--{limite}--\r\n'.encode()
    pet = urllib.request.Request(f'{API}/upload', data=cuerpo, method='POST',
                                 headers={**UA, 'Content-Type': f'multipart/form-data; boundary={limite}'})
    return json.load(urllib.request.urlopen(pet, timeout=120))[0]


def ejecutar(nombre, datos, sesion):
    """Encola una función en la sesión y espera su resultado por el flujo SSE de la cola."""
    cuerpo = {'data': datos, 'event_data': None, 'fn_index': FN[nombre], 'trigger_id': None, 'session_hash': sesion}
    pet = urllib.request.Request(f'{API}/queue/join', data=json.dumps(cuerpo).encode(), method='POST',
                                 headers={**UA, 'Content-Type': 'application/json'})
    evento = json.load(urllib.request.urlopen(pet, timeout=120))['event_id']
    flujo = urllib.request.urlopen(urllib.request.Request(f'{API}/queue/data?session_hash={sesion}', headers=UA), timeout=900)
    for linea in flujo:
        linea = linea.decode('utf-8', 'replace').strip()
        if not linea.startswith('data:'):
            continue
        msg = json.loads(linea[5:])
        if msg.get('event_id') not in (None, evento):
            continue
        tipo = msg.get('msg')
        if tipo == 'estimation':
            print(f"  en cola: puesto {msg.get('rank')} (~{msg.get('rank_eta') or 0:.0f} s)", flush=True)
        elif tipo == 'process_starts':
            print('  empieza en la GPU…', flush=True)
        elif tipo == 'progress':
            print('  progreso:', msg.get('progress_data'), flush=True)
        elif tipo == 'process_completed':
            if not msg.get('success', True):
                raise RuntimeError(f'Error del Space en {nombre}: {msg.get("output")}')
            return msg['output']['data']
    raise RuntimeError(f'La cola se cerró sin terminar {nombre}')


def main():
    imagen, salida = sys.argv[1], sys.argv[2]
    semilla = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    sesion = uuid.uuid4().hex[:11]
    t0 = time.time()
    print('Abriendo sesión…', flush=True)
    ejecutar('start_session', [], sesion)
    print('Subiendo la imagen…', flush=True)
    archivo = {'path': subir(imagen), 'meta': {'_type': 'gradio.FileData'}}
    print('Quitando el fondo…', flush=True)
    limpia = ejecutar('preprocess_image', [archivo], sesion)[0]
    print('Generando forma + textura…', flush=True)
    # imagen, galería, ¿multi-imagen?, semilla, guía/pasos (estructura), guía/pasos (detalle), algoritmo, simplificar, textura
    res = ejecutar('generate_and_extract_glb', [limpia, [], False, semilla, 7.5, 12, 3.0, 12, 'stochastic', 0.9, 1024], sesion)
    glb = next(r for r in res if isinstance(r, dict) and str(r.get('path', '')).endswith('.glb'))
    url = glb.get('url') or f"{API}/file={glb['path']}"
    print('Descargando el GLB…', flush=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r, open(salida, 'wb') as f:
        f.write(r.read())
    print(f'Listo en {time.time() - t0:.0f} s -> {salida}')


if __name__ == '__main__':
    main()
