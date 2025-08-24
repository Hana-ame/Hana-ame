from setuptools import setup, find_packages

setup(
    name="nanaka_tools",      # 包名（PyPI唯一标识）
    version="0.0.3",             # 遵循语义化版本规范
    packages=find_packages(),    # 自动查找包
    author="Nanaka",
    author_email="nanaka@moonchan.xyz",
    description="请更改描述",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/Hana-ame/Hana-ame/tree/py/nanaka_tools",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",     # 兼容Python 3.6+
    install_requires=[],         # 依赖库列表，如["requests>=2.0"]
    extras_require={              # 可选依赖（如测试）
        "test": ["pytest"]
    }
)