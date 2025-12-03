// api/margen.js
import { createClient } from '@supabase/supabase-js';

// Usamos la URL de la base de datos guardada en las variables de entorno de Vercel
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY // Necesitarás configurar estas dos variables
);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // --- OBTENER HISTORIAL (LEER) ---
        const { data, error } = await supabase
            .from('voto_margen')
            .select('timestamp, margin, votos_sn, votos_nj')
            .order('timestamp', { ascending: true }); // Ordenar por tiempo

        if (error) {
            console.error("Error al obtener datos de Supabase:", error);
            return res.status(500).json({ error: 'Fallo al cargar el historial' });
        }
        
        // Devolvemos los datos tal cual, el frontend se encarga de formatearlos
        return res.status(200).json(data);

    } else if (req.method === 'POST') {
        // --- GUARDAR NUEVO REGISTRO (ESCRIBIR) ---
        const { timestamp, margin, votos_sn, votos_nj } = req.body;
        
        if (!timestamp || margin === undefined || votos_sn === undefined || votos_nj === undefined) {
            return res.status(400).json({ error: 'Faltan campos requeridos.' });
        }

        const { error } = await supabase
            .from('voto_margen')
            .insert({
                timestamp,
                margin,
                votos_sn,
                votos_nj,
            });

        if (error) {
            console.error("Error al insertar datos en Supabase:", error);
            return res.status(500).json({ error: 'Fallo al guardar el registro' });
        }

        return res.status(201).json({ message: 'Registro guardado con éxito' });

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
