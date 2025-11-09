import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Key configured:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not configured in .env.local');
  console.error('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string|number} userId - User ID
 * @param {string} description - Optional description
 * @returns {Promise<Object>} - File info with download URL
 */
export const uploadFile = async (file, userId, description = '') => {
  try {
    // Validate inputs
    if (!file) {
      throw new Error('File is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required for upload');
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured. Please check .env.local');
    }

    console.log('📤 Upload Details:');
    console.log('  User ID:', userId);
    console.log('  File name:', file.name);
    console.log('  File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('  File type:', file.type);
    
    // Create unique filename
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `users/${userId}/documents/${fileName}`;
    
    console.log('📁 Upload path:', filePath);
    
    // Upload to Supabase Storage
    console.log('🚀 Starting Supabase upload...');
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(
        `Supabase error: ${error.message || error.statusCode || 'Unknown error'}`
      );
    }
    
    console.log('✅ File uploaded to Supabase:', data);
    
    // Get public URL
    console.log('🔗 Getting public URL...');
    const { data: publicData } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(filePath);
    
    console.log('✅ Public URL generated:', publicData.publicUrl);
    
    const result = {
      fileName: file.name,
      filePath: filePath,
      downloadURL: publicData.publicUrl,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      description: description
    };
    
    console.log('📦 Upload result:', result);
    return result;
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('  Error message:', error.message);
    console.error('  Error name:', error.name);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - File path to delete
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (filePath) => {
  try {
    console.log('Deleting file:', filePath);
    
    const { error } = await supabase.storage
      .from('medical-documents')
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message || 'Delete failed');
    }
    
    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Get public URL for a file
 * @param {string} filePath - File path
 * @returns {Promise<string>} - Public URL
 */
export const getFileUrl = async (filePath) => {
  try {
    const { data } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Get URL error:', error);
    throw error;
  }
};

/**
 * List all files for a user
 * @param {string|number} userId - User ID
 * @returns {Promise<Array>} - List of files
 */
export const listUserFiles = async (userId) => {
  try {
    console.log('Listing files for user:', userId);
    
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .list(`users/${userId}/documents`);
    
    if (error) {
      console.error('Supabase list error:', error);
      throw new Error(error.message || 'List failed');
    }
    
    console.log('Files found:', data);
    return data || [];
  } catch (error) {
    console.error('List error:', error);
    throw error;
  }
};

/**
 * Get file info with download URL
 * @param {string|number} userId - User ID
 * @param {string} fileName - File name (from list)
 * @returns {Promise<Object>} - File info with URL
 */
export const getFileInfo = async (userId, fileName) => {
  try {
    const filePath = `users/${userId}/documents/${fileName}`;
    const { data: publicData } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(filePath);
    
    return {
      fileName: fileName,
      filePath: filePath,
      downloadURL: publicData.publicUrl
    };
  } catch (error) {
    console.error('Get file info error:', error);
    throw error;
  }
};

export default supabase;
