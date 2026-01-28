# "残差被挤爆"现象深度研究报告

## 一、现象概述

### 1.1 什么是"残差被挤爆"

**"残差被挤爆"**（Residual Blowup / Residual Explosion）是深度学习领域描述深层神经网络训练不稳定性的专业术语，主要指在深层网络（特别是Transformer架构）中，由于残差连接（Residual Connection）的设计或参数问题，导致**信号或梯度在多层传播过程中被异常放大**，最终引发训练崩溃的现象。

### 1.2 核心表现形式

| 现象类型 | 具体表现 | 量化指标 |
|---------|---------|---------|
| **信号爆炸** | 前向传播中激活值急剧增大 | Amax Gain Magnitude 可达 3000× |
| **梯度爆炸** | 反向传播中梯度范数失控 | 梯度范数剧烈震荡 |
| **损失飙升** | 训练过程中损失函数突然增大 | Loss Spike |
| **模型更新爆炸** | 参数更新幅度过大 | Model Update 超过常数边界 |

---

## 二、深层原因分析

### 2.1 增量爆炸问题（Incremental Explosion）

**提出者**：苏剑林（科学空间，2022）

**核心洞见**：即使解决了梯度消失/爆炸问题，深层网络仍然难以训练，因为存在**增量爆炸**问题。

**数学推导**：

假设损失函数为 $$\mathcal{L}(\boldsymbol{\theta})$$，参数由 $$\boldsymbol{\theta}$$ 变为 $$\boldsymbol{\theta}+\Delta\boldsymbol{\theta}$$ 时：

$$\Delta\mathcal{L} = \mathcal{L}(\boldsymbol{\theta}+\Delta\boldsymbol{\theta}) - \mathcal{L}(\boldsymbol{\theta}) \approx \langle\nabla_{\boldsymbol{\theta}}\mathcal{L}(\boldsymbol{\theta}),\Delta\boldsymbol{\theta}\rangle$$

对于SGD优化器，$$\Delta\boldsymbol{\theta}=-\eta \nabla_{\boldsymbol{\theta}}\mathcal{L}(\boldsymbol{\theta})$$，则：

$$\Delta\mathcal{L} \approx -\eta\Vert\nabla_{\boldsymbol{\theta}}\mathcal{L}(\boldsymbol{\theta})\Vert^2$$

设模型有 $$N$$ 层，每层平均参数量为 $$K$$，若每个参数梯度为 $$\mathcal{O}(1)$$ 量级，则：

$$\Delta\mathcal{L}=\mathcal{O}(\eta NK)$$

**关键结论**：模型每一步的更新量**正比于模型深度 $$N$$**。网络越深，更新量越大，初始阶段越容易进入不好的局部最优点，导致训练停滞或崩溃。

### 2.2 恒等映射被破坏（Identity Mapping Destruction）

**标准残差连接**：

$$x_{l+1} = x_l + F(x_l, W_l)$$

关键特性是**恒等映射**——浅层信号 $$x_l$$ 可以不经过任何变换直接传递到深层。这保证了：
- 前向传播信号稳定
- 反向传播梯度有一条"高速公路"（常数1路径）

**Hyper-Connections的问题**：

当将单流残差扩展为多流并行并引入可学习混合矩阵 $$H^{res}$$ 时：

$$x_{l+1} = H^{res}_l \cdot x_l + F(x_l)$$

**致命缺陷**：$$H^{res}_l$$ 是完全无约束的可学习矩阵。多层连乘后的**复合映射**为：

$$\prod_{i=1}^{L-l} H^{res}_{L-i}$$

这个复合映射可以显著偏离恒等映射，导致：
- 某些信号路径被放大数千倍
- 某些信号路径被衰减至近乎消失

### 2.3 模型更新爆炸（Exploding Model Update）

**来源**：DeepNet论文（微软，2022）

**核心发现**：Post-LN Transformer训练不稳定的根本原因是**训练初期的模型更新过大**。

**连锁反应**：

1. **初始阶段**：大型模型更新使模型陷入糟糕的局部最优
2. **LN输入增大**：每个Layer Normalization的输入量随之增加
3. **梯度消失**：通过LN的梯度变得越来越小
4. **难以逃脱**：消失的梯度使模型难以摆脱局部最优
5. **稳定性破坏**：优化过程进一步失稳

---

## 三、典型案例分析

### 3.1 DeepSeek mHC中的残差爆炸

**实验设置**：27B参数模型，使用Hyper-Connections架构

**观察现象**：
- 训练至约12,000步时，损失突然飙升
- 梯度范数剧烈震荡
- **Amax Gain Magnitude峰值达到约3000**

**Amax Gain Magnitude定义**：

$$Amax\_Gain = \max(\text{row\_sum\_max}, \text{col\_sum\_max})$$

- 前向：最大绝对行和（信号放大度量）
- 反向：最大绝对列和（梯度放大度量）

**理想值**：接近1（恒等映射）
**HC实测值**：约3000（严重偏离）

### 3.2 DeepNet训练1000层Transformer

**核心挑战**：
- Post-LN在18层以上难以收敛
- 梯度消失与模型更新爆炸并存

**解决方案**：DEEPNORM

$$x_{l+1} = LayerNorm(\alpha \cdot x_l + G_l(x_l, \theta_l))$$

其中：
- $$\alpha > 1$$：放大残差连接（通常为 $$(2N)^{1/4}$$）
- 初始化时缩小参数 $$\beta$$（通常为 $$(2N)^{-1/4}$$）

**效果**：
- 模型更新被限制在常数范围内
- 成功训练1000层Transformer
- 200层模型（3.2B参数）超越48层SOTA模型（12B参数）5个BLEU

---

## 四、解决方案对比

### 4.1 残差缩放（Residual Scaling）

**核心思想**：通过缩放因子 $$\varepsilon$$ 控制残差分支的贡献

$$y = x + \varepsilon \cdot f(x;\theta)$$

**梯度分析**：

$$\frac{\partial \mathcal{L}}{\partial \theta} = \varepsilon \cdot \frac{\partial \mathcal{L}}{\partial y} \cdot \frac{\partial f}{\partial \theta}$$

**最优设置**：$$\varepsilon = 1/\sqrt{N}$$，可将梯度缩放到 $$\mathcal{O}(1/\sqrt{N})$$ 量级，抵消层数影响。

### 4.2 DeepNorm

| 组件 | 处理方式 | 公式 |
|-----|---------|------|
| 残差放大 | 乘以常数 $$\alpha$$ | $$\alpha \cdot x_l$$ |
| 参数缩小 | 初始化时乘以 $$\beta$$ | $$\beta \cdot \theta_l$$ |
| 适用参数 | FFN权重、Attention的V和O投影 | - |

**不同架构的参数**：

| 架构 | $$\alpha$$ | $$\beta$$ |
|-----|---------|---------|
| Encoder-only (N层) | $$(2N)^{1/4}$$ | $$(2N)^{-1/4}$$ |
| Decoder-only (N层) | $$(2N)^{1/4}$$ | $$(2N)^{-1/4}$$ |
| Encoder-Decoder (N-M层) | $$(3M)^{1/4}$$ | $$(12M)^{-1/4}$$ |

### 4.3 mHC（Manifold-Constrained Hyper-Connections）

**核心创新**：将残差混合矩阵约束在**Birkhoff多面体**（双随机矩阵流形）上

**数学约束**：
- 矩阵元素非负
- 每行和为1
- 每列和为1

**实现方法**：Sinkhorn-Knopp算法（约20次迭代）

**效果对比**：

| 指标 | HC（无约束） | mHC（有约束） | 改进幅度 |
|-----|-------------|--------------|---------|
| Amax Gain Magnitude | ~3000 | ~1.6 | **1875×** |
| 训练稳定性 | 不稳定（Loss Spike） | 稳定 | 质的飞跃 |
| 额外开销 | 高 | 6.7% | 可接受 |

---

## 五、理论总结

### 5.1 残差连接的本质价值

残差结构可以同时解决三个核心问题：

1. **稳定前向传播**：$$y = x + \varepsilon f(x)$$，当 $$\varepsilon$$ 足够小时，输出不会偏离输入太远
2. **稳定反向传播**：$$\frac{\partial y}{\partial x} = I + \varepsilon \frac{\partial f}{\partial x}$$，梯度有一条保底路径（单位矩阵）
3. **解决增量爆炸**：通过控制 $$\varepsilon$$ 实现层数相关的梯度缩放

### 5.2 无残差网络的局限

对于纯粹的前馈网络：

$$y = \phi_l(\phi_{l-1}(\cdots\phi_1(xW_1)\cdots)W_l)$$

- 前向传播稳定 $$\Rightarrow$$ 反向传播也固定
- 无法使梯度与层数 $$N$$ 相关
- **无法同时解决梯度消失/爆炸和增量爆炸**

### 5.3 关键设计原则

| 原则 | 说明 | 典型实现 |
|-----|------|---------|
| **恒等映射保持** | 确保信号有一条无损通路 | 标准残差连接的+操作 |
| **梯度有界性** | 防止梯度在深层网络中爆炸或消失 | 残差缩放、DeepNorm |
| **更新量控制** | 将模型更新限制在常数范围 | DEEPNORM的$$\alpha$$/$$\beta$$ |
| **复合映射稳定** | 多层连乘后仍接近恒等映射 | mHC的双随机约束 |

---

## 六、参考文献

1. **DeepNet**: Wang et al., "DeepNet: Scaling Transformers to 1,000 Layers", 2022
2. **科学空间**: 苏剑林, "为什么需要残差？一个来自DeepNet的视角", 2022
3. **科学空间**: 苏剑林, "训练1000层的Transformer究竟有什么困难？", 2022
4. **mHC**: DeepSeek, "mHC: Manifold-Constrained Hyper-Connections", 2026
5. **ResNet**: He et al., "Deep Residual Learning for Image Recognition", 2016
6. **Admin**: Liu et al., "Understanding the Difficulty of Training Transformers", 2020

---

*报告生成时间：2026年1月27日*