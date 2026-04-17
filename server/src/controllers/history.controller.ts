import { Request, Response, NextFunction } from 'express'
import { supabase } from '../db/supabase'

export const getCallHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filter, search } = req.query as { filter?: string, search?: string };
    
    let query = supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply Filter logic
    if (filter === 'missed') {
      query = query.in('status', ['no-answer', 'busy']);
    } else if (filter === 'incoming') {
      query = query.eq('direction', 'inbound');
    } else if (filter === 'outgoing') {
      query = query.eq('direction', 'outbound');
    }

    // Apply Search logic
    if (search) {
      query = query.or(`from_number.ilike.%${search}%,to_number.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) { next(err) }
}

export const getCallById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from('calls').select('*').eq('id', id).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export const deleteCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('calls').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
}
