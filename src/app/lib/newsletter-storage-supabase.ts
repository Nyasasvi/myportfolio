// Supabase-powered newsletter storage
import { supabase, Newsletter, Subscriber, AIArticle } from './supabase-client';

// Newsletter operations
export async function getAllNewsletters(): Promise<Newsletter[]> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('edition', { ascending: false });

    if (error) {
      console.error('Error fetching newsletters:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllNewsletters:', error);
    return [];
  }
}

export async function getNewsletterById(id: string): Promise<Newsletter | null> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching newsletter by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getNewsletterById:', error);
    return null;
  }
}

export async function getNewsletterByEdition(edition: number): Promise<Newsletter | null> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('edition', edition)
      .single();

    if (error) {
      console.error('Error fetching newsletter by edition:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getNewsletterByEdition:', error);
    return null;
  }
}

export async function saveNewsletter(newsletter: Newsletter): Promise<Newsletter> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .upsert(newsletter, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving newsletter:', error);
      throw error;
    }

    console.log(`📝 Newsletter #${newsletter.edition} saved to Supabase`);
    return data;
  } catch (error) {
    console.error('Error in saveNewsletter:', error);
    throw error;
  }
}

export async function getLatestEditionNumber(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('edition')
      .order('edition', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest edition:', error);
      return 0;
    }

    return data && data.length > 0 ? data[0].edition : 0;
  } catch (error) {
    console.error('Error in getLatestEditionNumber:', error);
    return 0;
  }
}

// Subscriber operations
export async function getAllSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllSubscribers:', error);
    return [];
  }
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('unsubscribed', false)
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error fetching active subscribers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveSubscribers:', error);
    return [];
  }
}

export async function addSubscriber(email: string, interests: string[] = []): Promise<Subscriber> {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing && !existing.unsubscribed) {
      return existing;
    }

    if (existing && existing.unsubscribed) {
      // Resubscribe
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          unsubscribed: false,
          subscribed_at: new Date().toISOString(),
          interests
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error resubscribing user:', error);
        throw error;
      }

      console.log(`📧 User resubscribed: ${email}`);
      return data;
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      id: Date.now().toString(),
      email,
      subscribed_at: new Date().toISOString(),
      unsubscribed: false,
      interests
    };

    const { data, error } = await supabase
      .from('subscribers')
      .insert(newSubscriber)
      .select()
      .single();

    if (error) {
      console.error('Error adding subscriber:', error);
      throw error;
    }

    console.log(`📧 New subscriber added: ${email}`);
    return data;
  } catch (error) {
    console.error('Error in addSubscriber:', error);
    throw error;
  }
}

export async function unsubscribe(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ unsubscribed: true })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error unsubscribing user:', error);
      return false;
    }

    console.log(`📧 Subscriber unsubscribed: ${email}`);
    return !!data;
  } catch (error) {
    console.error('Error in unsubscribe:', error);
    return false;
  }
}

// Initialize with sample data if tables are empty
export async function initializeSampleData(): Promise<void> {
  try {
    // Check if we have any newsletters
    const newsletters = await getAllNewsletters();
    if (newsletters.length === 0) {
      const sampleNewsletter: Newsletter = {
        id: 'sample-1',
        edition: 1,
        title: 'AI Weekly #1: Top 10 Updates',
        published_at: new Date().toISOString(),
        articles: [],
        subscribers: 0,
        status: 'published'
      };
      await saveNewsletter(sampleNewsletter);
      console.log('📝 Sample newsletter created');
    }

    // Check if we have any subscribers
    const subscribers = await getAllSubscribers();
    if (subscribers.length === 0) {
      const sampleSubscriber: Subscriber = {
        id: 'sub-1',
        email: 'yasasvi.nellore@gmail.com',
        subscribed_at: new Date().toISOString(),
        unsubscribed: false,
        interests: ['AI', 'Machine Learning']
      };
      await addSubscriber(sampleSubscriber.email, sampleSubscriber.interests);
      console.log('📧 Sample subscriber added');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
