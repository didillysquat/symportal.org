"""DataSet table

Revision ID: f56081464d8f
Revises: 3ef847ed15e3
Create Date: 2019-12-16 08:55:42.287664

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f56081464d8f'
down_revision = '3ef847ed15e3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('data_set',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('data_name', sa.String(length=64), nullable=True),
    sa.Column('study_name', sa.String(length=64), nullable=True),
    sa.Column('study_to_load_str', sa.String(length=64), nullable=True),
    sa.Column('title', sa.String(length=500), nullable=True),
    sa.Column('location', sa.String(length=64), nullable=True),
    sa.Column('num_samples', sa.Integer(), nullable=True),
    sa.Column('additional_markers', sa.String(length=200), nullable=True),
    sa.Column('is_published', sa.Boolean(), nullable=True),
    sa.Column('run_type', sa.String(length=64), nullable=True),
    sa.Column('article_url', sa.String(length=200), nullable=True),
    sa.Column('seq_data_url', sa.String(length=200), nullable=True),
    sa.Column('data_explorer', sa.Boolean(), nullable=True),
    sa.Column('upload_timestamp', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_data_set_data_name'), 'data_set', ['data_name'], unique=True)
    op.create_index(op.f('ix_data_set_study_name'), 'data_set', ['study_name'], unique=True)
    op.create_index(op.f('ix_data_set_study_to_load_str'), 'data_set', ['study_to_load_str'], unique=True)
    op.create_index(op.f('ix_data_set_title'), 'data_set', ['title'], unique=True)
    op.create_index(op.f('ix_data_set_upload_timestamp'), 'data_set', ['upload_timestamp'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_data_set_upload_timestamp'), table_name='data_set')
    op.drop_index(op.f('ix_data_set_title'), table_name='data_set')
    op.drop_index(op.f('ix_data_set_study_to_load_str'), table_name='data_set')
    op.drop_index(op.f('ix_data_set_study_name'), table_name='data_set')
    op.drop_index(op.f('ix_data_set_data_name'), table_name='data_set')
    op.drop_table('data_set')
    # ### end Alembic commands ###
