import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { Conversation, Message, Quote as _Quote, Contact, Order, User } from '../types';

const safeGetTime = (dateValue: any): number => {
    if (!dateValue) return 0;
    // FIX: Removed the '.toDate' check, which is a legacy pattern from Firebase. Supabase returns ISO strings, which the 'new Date()' constructor