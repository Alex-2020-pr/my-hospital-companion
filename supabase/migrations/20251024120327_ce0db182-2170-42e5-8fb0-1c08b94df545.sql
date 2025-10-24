-- Add new fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add index for CNPJ lookups
CREATE INDEX IF NOT EXISTS idx_organizations_cnpj ON organizations(cnpj);

COMMENT ON COLUMN organizations.cnpj IS 'CNPJ da organização (apenas números)';
COMMENT ON COLUMN organizations.website IS 'Website da organização';