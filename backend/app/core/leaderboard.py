import numpy as np
import pandas as pd

def elo_calculation(df, step_size):
    # Create design matrix
    X_player = pd.get_dummies(df['Player'])
    players = X_player.columns
    X_player = X_player.to_numpy()
    X_target = pd.get_dummies(df['Target'])
    targets = X_target.columns
    X_target = X_target.to_numpy()
    X_model = pd.get_dummies(df['Model'])
    models = X_model.columns
    X_model = X_model.to_numpy()
    X = np.concatenate([X_player, X_target, X_model], axis=1)
    # Create the result vector
    Y = df['Result'].to_numpy()

    # Run online logistic
    _, d = X.shape
    beta = np.zeros(d)
    
    def sigmoid(z):
        return 1 / (1 + np.exp(-z))
    
    for i in range(len(X)):
        x_i = X[i]
        y_i = Y[i]
        
        # Compute the gradient
        z = np.dot(x_i, beta)
        h = sigmoid(z)
        gradient = x_i * (h - y_i)
        
        # Update beta
        beta -= step_size * gradient
    player_dict = { players[j]: beta[j] for j in range(len(players)) }
    target_dict = { targets[j]: -beta[len(players) + j] for j in range(len(targets)) }
    model_dict = { models[j]: -beta[len(players) + len(targets) + j] for j in range(len(models)) }

    return {"players" : player_dict, "targets" : target_dict, "models" : model_dict}


def get_elo_by_player(elo_ratings, player):
    return elo_ratings["players"].get(player, 0)