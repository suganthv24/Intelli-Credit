from lime.lime_tabular import LimeTabularExplainer
import numpy as np

def lime_explain(model, X_train, instance_df):
    """
    Given a fitted classification model, training background dataset, and a single instance,
    computes localized LIME explanations.
    """
    explainer = LimeTabularExplainer(
        training_data=np.array(X_train),
        feature_names=X_train.columns,
        class_names=['Approved', 'Default'],
        mode='classification',
        random_state=42
    )

    # Explanation of a single instance
    explanation = explainer.explain_instance(
        data_row=instance_df.values[0],
        predict_fn=model.predict_proba,
        num_features=5
    )

    # Returns a list of tuples: [('feature > value', weight), ...]
    return explanation.as_list()
