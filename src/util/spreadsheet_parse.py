import pandas as pd
import numpy as np

if __name__ == '__main__':
    base = pd.read_excel("Lab Analysis.xlsx", sheet_name="Bright Beer")
    detail = pd.read_excel("Fermentation Curves.xlsx", sheet_name="Flag Compiled")

    batch_split = detail["BATCH"].str.split(":", n = 1, expand = True)
    detail["Batches"] = batch_split[0]

    tank_gen = batch_split[1].str.split(" ", n = 3, expand = True)
    detail["Tank"] = tank_gen[1]
    detail["Generation"] = tank_gen[3]

    merged = pd.merge(detail, base, left_on="Batches", right_on="Batches", how="inner").drop_duplicates(subset=["Batches"])
    merged = merged.dropna(subset=["Tank","Beer","Date","pH "], how="any")

    merged["pH"] = merged["pH "]
    del merged["pH "]
    merged["Day"] = None

    final = pd.DataFrame(columns=[
        "Tank",
        "Batch",
        "Generation",
        "Recipe",
        "pH", 
        "ABV", 
        "Bright", 
        "Pressure", 
        "Volume", 
        "SG", 
        "Temperature", 
        "Date"
    ])

    max_days = pd.DataFrame(columns=[
        "Batches",
        "MaxDays"
    ])
    for day in range(18,-1,-1):
        subset = merged.dropna(subset=[day])
        subset["Day"] = day
        
        new_batches = subset.loc[~subset["Batches"].isin(max_days["Batches"])].drop_duplicates(subset=["Batches"])
        
        max_days = max_days.append(new_batches[["Batches"]], ignore_index=True)
        max_days.loc[max_days["MaxDays"].isnull(), "MaxDays"] = day

        subset = pd.merge(subset, max_days, left_on="Batches", right_on="Batches", how="inner")

        subset["SG"] = subset[day]
        subset["Date"] = subset['Date'].values.astype('datetime64[D]') + (subset["Day"] - subset["MaxDays"]).values.astype('timedelta64[D]')
        subset["Batch"] = subset["Batches"]
        subset["Recipe"] = subset["Beer"]

        subset["Bright"] = subset.apply(lambda x: np.around(np.random.rand(1)[0]*3 + 2, decimals=2), axis=1)
        subset["Pressure"] = subset.apply(lambda x: np.around(np.random.rand(1)[0]*6 + 7, decimals=2), axis=1)
        subset["Temperature"] = subset.apply(lambda x: np.around(np.random.rand(1)[0]*30 + 45, decimals=2), axis=1)
 
        final = final.append(subset[[
            "Tank",
            "Batch",
            "Generation",
            "Recipe",
            "pH", 
            "ABV", 
            "Bright", 
            "Pressure", 
            "Volume", 
            "SG", 
            "Temperature", 
            "Date"
        ]], ignore_index=True)

    final = final[final["Tank"] != "GEN"]
    final.to_csv(path_or_buf="test_data.csv", index=False)
    print(final)
    