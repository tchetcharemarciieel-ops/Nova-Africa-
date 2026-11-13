"""Logo 1080x1080 (photo de profil TikTok) : python3 logo.py"""
import math, sys
sys.argv=['x']
import render as r
from PIL import Image, ImageDraw
S=1080; k=S/720
img=Image.new("RGB",(S,S),(14,24,52)); big=Image.new("RGB",(720,720),(14,24,52))
r.W,r.H=720,720; r.CX,r.CY,r.R=360,360,300
r.STARS[:]=[]
owners=set(r.COUNTRIES)
r.draw_globe(big,15,owners,None,12)
img=big.resize((S,S),Image.LANCZOS)
d=ImageDraw.Draw(img,"RGBA")
d.ellipse([20,20,S-20,S-20],outline=(70,230,120,255),width=14)
f=r.F(92); t="LE MONDE"; w=d.textlength(t,font=f)
d.rounded_rectangle([(S-w)/2-30,S-290,(S+w)/2+30,S-110],24,fill=(20,26,50,235))
d.text(((S-w)/2,S-278),t,font=f,fill=(255,255,255))
f2=r.F(58); t2="C'EST VOUS"; w2=d.textlength(t2,font=f2)
d.text(((S-w2)/2,S-185),t2,font=f2,fill=(231,60,60))
img.save("out/logo.png")
