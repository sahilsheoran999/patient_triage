import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os

def create_splits(csv_path: str = 'ml/data/patienttriage_synthetic_xgboost_15000.csv', output_dir: str = 'ml/data/splits'):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading raw dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # 70% train, 30% temp (which will be 15% val, 15% test)
    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=42,
        stratify=df['acuity_label']
    )
    
    # Split temp 50/50 -> 15% val, 15% test
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=42,
        stratify=temp_df['acuity_label']
    )
    
    print(f"Train shape: {train_df.shape}")
    print(f"Val shape:   {val_df.shape}")
    print(f"Test shape:  {test_df.shape}")
    
    train_path = os.path.join(output_dir, 'train.csv')
    val_path = os.path.join(output_dir, 'val.csv')
    test_path = os.path.join(output_dir, 'test.csv')
    
    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)
    
    print(f"Splits saved successfully to {output_dir}/")
    return train_path, val_path, test_path

if __name__ == '__main__':
    create_splits()
